
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'react-simple-chatbot';

import Speech from 'speak-tts'

const speech = new Speech()
require('dotenv').config()


const { Configuration, OpenAIApi } = require("openai");

let gpt_model = process.env.REACT_APP_MODEL;

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

speech.init({
  'volume': 1,
  //'lang': 'en-GB',
  //'lang': 'de-DE',
  'lang': 'en-US',
  'rate': 1,
  'pitch': 1,
  'voice': 'Aaron',
  'splitSentences': true,
  'listeners': {
    'onvoiceschanged': (voices) => {
      console.log("Event voices changed", voices)
    }
  }
})

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

      let query = search.trim() + "\n"

      let textToSpeak = ''
      try {

        if (search) {

          const response = await openai.createCompletion(gpt_model, {
            prompt: query,
            temperature: 0.3,
            max_tokens: 300,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            stop: ["#", ";"],
          });

          console.log('response:', response);
          textToSpeak = response.data.choices[0].text;

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

      speech.speak({ text: textToSpeak })
          .then(() => { console.log("Success: " + textToSpeak) })
          .catch(e => { console.error("An error occurred :", e) })

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

export default DoctorAI;
