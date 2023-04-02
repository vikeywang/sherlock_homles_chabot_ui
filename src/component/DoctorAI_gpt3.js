
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'react-simple-chatbot';

import Speech from 'speak-tts'

const speech = new Speech()
require('dotenv').config()

const reg = "#.*?#"
const neo4j = require('neo4j-driver')

const driver = neo4j.driver("", neo4j.auth.basic("neo4j", ""));
const session = driver.session()


const { Configuration, OpenAIApi } = require("openai");
let gpt_model = "";
// let gpt_model = "gpt-3.5-turbo";
const configuration = new Configuration({
  apiKey: ""
});
const openai = new OpenAIApi(configuration);

const text2cypher = `

#What is the relation between Sherlock Holmes and Merrilow?;Tell me the relation between Sherlock Holmes and Merrilow
CYPHER: MATCH (c1:Character)-[r:RELATION]->(c2:Character) WHERE c1.name =~ '(?i)Sherlock Holmes' AND c2.name =~ '(?i)Merrilow' RETURN r.relationship

#What did Merrilow say to Sherlock Holmes?;What has Merrilow said to Sherlock Holmes?;Give me all the dialogs that Merrilow said to Sherlock Holmes.
CYPHER: MATCH (c1:Character)-[r:DIALOG]->(c2:Character) WHERE c1.name =~ '(?i)Merrilow' AND c2.name =~ '(?i)Sherlock Holmes' RETURN r.prompts

#What are the sentiments of Merrilow toward Sherlock Holmes?;;Give me all the sentiments that Merrilow had toward Sherlock Holmes.
CYPHER: MATCH (c1:Character)-[r:DIALOG]->(c2:Character) WHERE c1.name =~ '(?i)Merrilow' AND c2.name =~ '(?i)Sherlock Holmes' RETURN r.sentiment

#Who are you?;What are you doing now?;tell me something about Watson?;give me some examples; What do you think of Watson?
Who are you?;What are you doing now?;tell me something about Watson?;give me some examples; What do you think of Watson?

#`

// speech.init({
//   'volume': 1,
//   //'lang': 'en-GB',
//   //'lang': 'de-DE',
//   'lang': 'en-US',
//   'rate': 1,
//   'pitch': 1,
//   'voice': 'Aaron',
//   'splitSentences': true,
//   'listeners': {
//     'onvoiceschanged': (voices) => {
//       console.log("Event voices changed", voices)
//     }
//   }
// })

class DoctorAI extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      result: ''
    };

    this.triggetNext = this.triggetNext.bind(this);
  }


  callDoctorAI() {
    const self = this;
    const { steps } = this.props;
    const search_raw = steps.user.value.trim();

    async function callAsync() {
  
      let search = search_raw;
      

      //let search = "Tell me something about the disease called COVID-19?";

      var query = search.trim() + "\n"
      query = "You are Sherlock Holmes. Friend:What are you doing?\nYou:I am talking with you.\nFriend:" + query + "\nYou:"

      let textToSpeak = ''
      try {
        var neo_result = search.startsWith("#")
        console.log("neo:" + neo_result)
        var title = search.match(reg)
        console.log("title:" + title)
        neo_result = search.replace(title,"")
        if (neo_result) {
          console.log(text2cypher + neo_result)
          const re = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: text2cypher + neo_result,
            temperature: 0.1,
            max_tokens: 300,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
           });

          console.log('response:', re);
          var cypher_res = re.data.choices[0].text.trim().replace("\n","");
          console.log(cypher_res)
          if (cypher_res.startsWith("CYPHER:")) {
            cypher_res = cypher_res.replace("CYPHER:","")
            const result = await session.run(cypher_res)
            console.log("result:" +result)

            const myrecords = result.records
            var text = ""
            console.log("records:" + myrecords)
            if (myrecords.length > 1) {
                myrecords.forEach(element => {
                  textToSpeak += element.get(0) + ", "
                });
            } else {
              textToSpeak = myrecords[0].get(0)
            }
          } else {
              const response = await await openai.createCompletion({
                model: gpt_model,
                prompt: query,
                temperature: 0.1,
                max_tokens: 300,
                top_p: 1.0,
                frequency_penalty: 0.0,
                presence_penalty: 0.0,
                stop: ["Friend:"],
              });

              console.log('response:', response);
              textToSpeak = response.data.choices[0].text.trim().replace("\n","");
          }
          

        }else {
                if (search) {
                  console.log(search)
                  const response = await await openai.createCompletion({
                    model: gpt_model,
                    prompt: query,
                    temperature: 0.1,
                    max_tokens: 300,
                    top_p: 1.0,
                    frequency_penalty: 0.0,
                    presence_penalty: 0.0,
                    stop: ["Friend:"],
                  });

                  console.log('response:', response);
                  textToSpeak = response.data.choices[0].text.trim().replace("\n","");

                }
        }
      }
      catch (error) {
        //console.log(process.env);
        console.error(error)
        console.log('Doctor AI:' + textToSpeak);
        //textToSpeak = "Sorry I can't answer that. Could you please try again?"
        textToSpeak = "Sorry I can't answer that. Could you please try again?"
      }
      self.setState({ loading: false, result: textToSpeak });
      // speech.speak({ text: textToSpeak })
      //     .then(() => { console.log("Success: " + textToSpeak) })
      //     .catch(e => { console.error("An error occurred :", e) })

    }
    callAsync();
  }

  triggetNext() {
    this.setState({}, () => {
      this.props.triggerNextStep();
    });
  }

  componentDidMount() {
    this.callDoctorAI();
    this.triggetNext();
  }

  render() {
    const { loading, result } = this.state;
    const lines = result.split("\n");
    const elements = [];
    for (const [index, value] of lines.entries()) {
      elements.push(<span key={index}>{value}<br /></span>)
    }

    return (
      <div className="bot-response">
        {loading ? <Loading /> : elements}
      </div>
    );
  }



}

DoctorAI.propTypes = {
  steps: PropTypes.object,
  triggerNextStep: PropTypes.func,
};

DoctorAI.defaultProps = {
  steps: undefined,
  triggerNextStep: undefined,
};



function call_neo4j(search) {
    
  try {
    const result =  session.run(search)
    const records = result.records
    var text = ""
    records.forEach(element => {
      text += element.get(0) + ", "
    });
    return text
  } finally {
    //await session.close()
  }
};

function call_gpt(query,stop) {
  const response =  openai.createCompletion(gpt_model, {
    prompt: query,
    temperature: 0.1,
    max_tokens: 300,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    stop: [stop],
  });

  console.log('response:', response);

  return response.data.choices[0].text.trim().replace("\n","");
};

export default DoctorAI;
