import './App.css';
import ChatBot from 'react-simple-chatbot';
import { ThemeProvider } from 'styled-components';
import DoctorAI from './component/DoctorAI_gpt3';
import { NeoVisComponent  } from './component/NeoVis';
import React, { useEffect, useRef } from "react";
import "./Alan.css";
import alanBtn from "@alan-ai/alan-sdk-web";


const alan_api = "b70771382475d1df0fca2b0c9257c0252e956eca572e1d8b807a3e2338fdd0dc/stage";
//const target_language = "Chinese"
//const target_language = "Japanese"
//const target_language = "English"
const lang_p = "English"

const ENABLE_THEME = true

const theme_red = {
  background: '#f5f8fb',
  fontFamily: 'Tahoma',
  headerBgColor: '#8D4BBB',
  headerFontColor: '#fff',
  headerFontSize: '15px',
  botBubbleColor: '#8D4BBB',
  botFontColor: '#fff',
  userBubbleColor: '#fff',
  userFontColor: '#4a4a4a',
};

const theme = ENABLE_THEME ? theme_red : ''

{/* <div  key={index}> {value} <a href={link}><button>点击购买</button></a></div> */}
const steps = [
  {
    id: 'bot-welcome',
    message: "Welcome to Bookverse,you can chat with me or you can click  to know more detials about this novel.",
    // trigger: 'user'
    trigger: "search"
  },
  {
    // id: 'user',
    // user: true,
    // trigger: 'bot-response'
    id: "search",
    // user: true,
    // placeholder: "Type your question here...",
    // trigger: "bot-response",
    options:[
      {value: 1,label:"剧情", trigger:"bot-response1"},
      {value: 2, label:"闲聊",trigger:"bot-response2"}
    ],
  },
  {
    id: 'bot-response1',
    // component: <DoctorAI />,
    component: <NeoVisComponent />,
    waitAction: true,
    asMessage: true,
    // trigger: 'user'
    trigger: "search"
  },
  {
    id: 'bot-response2',
    // component: <DoctorAI />,
    component: <NeoVisComponent />,
    waitAction: true,
    asMessage: true,
    // trigger: 'user'
    trigger: "search"
  },
  {
    id: 'not-bye',
    message: 'Thank you. Have a great day!',
    end: true
  },
];

// function App() {
//   const alanBtnContainer = useRef();
//   let chatbotObject = null;
//   let chatbot = (
//     <ChatBot
//       steps={steps}
//       ref={(node) => (chatbotObject = node)}
//       headerTitle="Bookverse"
//       botAvatar="bookverse_ai.png"
//       userAvatar="user.png"
//       recognitionEnable={true}
//       width="750px"
//       speechSynthesis={{ enable: false, lang: "en" }}
//     />
//   );

//   useEffect(() => {
//     alanBtn({
//       key: alan_api,
//       //rootEl: alanBtnContainer.current,
//       onCommand: (commandData) => {
//         //console.log("commandData", commandData);
//         // if (commandData.command === 'command-example') {
//         //   if (logoEl.current) {
//         //       logoEl.current.style.transform = 'rotate(180deg)';
//         //   }
//         // }
//       },
//       onEvent: function(e) {
//         switch (e.name) {
//           case "recognized":
//             console.info("Interim results:", e.text);
//             break;
//           case "parsed":
//             console.info("Final result:", e.text);
//             chatbotObject.onRecognitionChange(e.text);
//             break;
//           case "text":
//             console.info("Alan reponse:", e.text);

//             break;
//           default:
//             console.info("Unknown event");
//         }
//       },
//     });
//   }, [chatbotObject]);

  function App() {
    const alanBtnContainer = useRef();
    var chatbotObject = null;
    let chatbot = (
      <ChatBot
        steps={steps}
        ref={(node) => (chatbotObject = node)}
        headerTitle="Doctor.ai"
        botAvatar="doctor.ai_trans.png"
        userAvatar="user.png"
        recognitionEnable={true}
        width="1200px"
        height="1200px"
        speechSynthesis={{ enable: false, lang: "en" }}
      />
    );
  
    useEffect(() => {
      alanBtn({
        key: alan_api,
        rootEl: alanBtnContainer.current,
        onCommand: (commandData) => {
          console.log(
            "----------------------------------------------------",
            "commandData",
            commandData
          );
          if (commandData.command === "neo4j-query") {
            chatbotObject.onRecognitionChange(commandData.data);
            chatbotObject.onRecognitionEnd();
          }
        },
      });
    }, [chatbot]);

  return (
    <div className="App" style={{ display: "flex", justifyContent: "center" }}>
      {theme !== "" ? (
        <ThemeProvider theme={theme}> {chatbot} </ThemeProvider>
      ) : (
        chatbot
      )}
      <div ref={alanBtnContainer}></div>
    </div>
  );
}

export default App;
