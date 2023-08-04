
// export default Chatbot;
import React, { useState, useRef, useEffect } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyBlock, dracula } from "react-code-blocks";

import ChatInput from '../Inputs/ChatInput'
import Audio from '../Audio/Audio'
import Tooltip from "../Tooltips/Tooltip";

import styles from './Chat.module.css'



function Chatbot( {setMessagesForDisplay, setPlanner, setIsSum2, person, setIsPersonChanged,  isPersonChanged}) {
  const [chatMessages, setChatMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [currInput, setCurrInput] = useState("");
  const [currSummary, setCurrSummary] = useState("");
  const [currMessage, setCurrMessage] = useState("");
  const [reset, setReset] = useState(0)

  // const [currDictatedWord, setCurrDictatedWord] = useState('')
  const [currDictatedWord, setCurrDictatedWord] = useState({})

  const [messageCount, setMessageCount] = useState(0);
  const [isSum, setIsSum1] = useState(false);

  const [chatRefs, setChatRefs] = useState([]);




  const currChatRef = useRef();
  const mes = useRef();
  const messagesEndRef = useRef(null);

  
    // // Function to handle word highlighting
    // const highlightWord = (word) => {
    //   console.log("i am word", word)
    //   if(currMessage){
    //   console.log("i am currChatRef",currChatRef)
    //   const currChatText = currChatRef?.current?.innerText;
    //   const words = currChatText?.split(" ");
    //   console.log("i am words", words)

    //   const highlightedText = words?.map((w, i) => (i === word.index ? `<mark className="highlight">${w}</mark>` : w))

    //     .join(" ");
    //     // .map((w, i) => (w === word ? `<mark className="highlight">${w}</mark>` : w))

    //   currChatRef.current.innerHTML = highlightedText;}
    // };

    const highlightWord = (word) => {
      if (currMessage) {
        var indx = 0;
        console.log("messagesEndRef", messagesEndRef);
        chatRefs.forEach((chatRef) => {
          const currChatText = chatRef?.current?.innerText;
          console.log("i am chatRef", chatRef);
    
          const words = currChatText?.split(" ");
    
          const highlightedText = words
            ?.map((w, i) => {
              let result =
                indx === word.index ? `<mark className="highlight">${w}</mark>` : w;
              indx++;
              return result;
            })
            .join(" ");
          try {
            chatRef.current.innerHTML = highlightedText;
          } catch (e) {
            console.log("error with highlight", e);
          }
        });
      }
    };
    
// const highlightWord = (word) => {
//   if (currMessage) {
//     console.log("messagesEndRef", messagesEndRef);
//     const currChatText = messagesEndRef?.current?.innerText;
//     const paragraphs = currChatText?.split("\n");
//     var indx = 0;
//     const highlightedText = paragraphs
//       ?.map((paragraph) => {
//         const words = paragraph.split(" ");
//         return words
//           .map((w, i) => {
//             let result =
//               indx === word.index ? `<mark className="highlight">${w}</mark>` : w;
//             indx++;
//             return result;
//           })
//           .join(" ");
//       })
//       .join("<br>");

//     try {
//       console.log("highlightedText", highlightedText);
//       // messagesEndRef.current.innerHTML = highlightedText;
//     } catch (e) {
//       console.log("error with highlight", e);
//     }
//   }
// };



  // Update chatRefs whenever chatMessages changes
  useEffect(() => {
    setChatRefs(currMessage.split('\n').map(() =>  React.createRef()))
  }, [currMessage]);

  console.log("chatMessages", chatMessages)

  useEffect(() => {
    highlightWord(currDictatedWord);
  }, [currDictatedWord]);

  useEffect(() => {
    setMessageCount(0);
  }, [reset]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);


  useEffect(() => {
    return () => {
      setChatMessages([]);
    };
  }, []);


  useEffect(() => {
    setAllMessages((prevAllMessages) => [...prevAllMessages, currInput]);
  }, [currInput]);

  const call_GPT = async (input) => {
    setAllMessages((prevAllMessages) => [...prevAllMessages, chatMessages]);

    // setChatMessages((prevMessages) => [...prevMessages, "AI: Generating response..."]);
    setChatMessages(["AI: Generating response..."]);
    // console.log("messageCount", messageCount)

    try {
      var response = ''
      // if(messageCount % 2 == 0 && messageCount !== 0){

        if(messageCount === 2 || messageCount === 4 || messageCount === 6)
        {
          input = input + ". At the end of your response, as my AI coach, summarize my challenges and plans so far"
          // Between two brackets, like [step1, step2, ... ] offer the top steps for me to take so far to achieve my goals"
          console.log("i am summarizing", messageCount)
          setIsSum1(true)
        }
        else{
          // setIsSum2(false)
          setIsSum1(false)
        }

        console.log("isPersonChanged, person", isPersonChanged, person)
      
        response = await fetch("/api/stream_memory_embeds_update_template", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input, messageCount, person, isPersonChanged, reset}),
        });




      const reader = response.body.getReader();
      let curr_message = "AI: ";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // setChatMessages((prevMessages) => [...prevMessages.slice(0, -1), curr_message]);
          setMessagesForDisplay((prevMessages) => [...allMessages, curr_message])
          setIsPersonChanged(false)
          setCurrMessage(curr_message)
          setReset(0)
          // 
          if(messageCount === 2 || messageCount === 4 || messageCount === 6)

          {
            setCurrSummary(curr_message)
            // setIsSum2(true)
            console.log("i am planning", curr_message)

            setPlanner(curr_message)

          }
          break;
        }

        const decodedValue = new TextDecoder().decode(value);
        curr_message += decodedValue;

        setChatMessages((prevMessages) => [...prevMessages.slice(0, -1), curr_message]);
        

      }

      // setAllMessages((prevAllMessages) => [...prevAllMessages, `AI: ${curr_message}`]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleButtonClick = async (mes) => {
    // e.preventDefault();


    setMessageCount(prevCount => prevCount + 1)
// if messsage count greater than random number bet 5-10 we ask to summarize and then make a plan
    console.log("messageCount", messageCount)
    const input = mes //mes.current.value;
    // console.log(input);
    setCurrInput("HUMAN: " + input);
    call_GPT(input);
    // mes.current.value = "";
  };


  let index = 0

  return (
    <>
 <div
  style={{
  }}
>
      </div>

      {/* <div style={{border: '1px solid lightblue', margin: '3px', padding: '5px'}}> */}
      <div
      style={{
        fontFamily: 'monospace',
        fontSize: '18px',
        lineHeight: '1.1',
      }}
       >

      {allMessages.map((message, index) => (
        <p 
         style={{
          fontFamily: 'monospace',
          fontSize: '18px',
          lineHeight: '1.1',
        }}
        key={index}>{message}</p>
      ))}
      <div
      
      ref={messagesEndRef}
      
      >
      {/* <ReactMarkdown
  children={chatMessages.join("\n")}
  remarkPlugins={[remarkGfm]}
  className={styles.markdown}

  components={{
    p: ({ node, ...props }) => (
      <p
      className='currChat'
        ref= {currChatRef} // {index === allMessages.length - 1 ? currChatRef : null}
            
        style={{
          fontFamily: 'monospace',
          fontSize: '18px',
          lineHeight: '1.1',
         }}
        {...props}
      />
    ),
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <CopyBlock
          text={String(children).replace(/\n$/, "")}
          language={match[1]}
          showLineNumbers
          theme={dracula}
          wrapLines
          {...props}
        />
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  }}
/> */}
<ReactMarkdown
  children={chatMessages.join("\n")}
  remarkPlugins={[remarkGfm]}
  className={styles.markdown}
  components={{
    p: ({ node, ...props }) => {
      // Create a new ref for each paragraph
      // const ref = useRef(null);
      // setChatRefs((refs) => [...refs, ref]);
      // const index = chatMessages.indexOf(node.children[0].value);
      const currentIndex = index;
          index++;

      return (
        <p
          className="currChat"
          // ref={ref}
          ref={chatRefs[currentIndex]}
          style={{
            fontFamily: "monospace",
            fontSize: "18px",
            lineHeight: "1.1",
          }}
          {...props}
        />
      );
    },
    // ...
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <CopyBlock
          text={String(children).replace(/\n$/, "")}
          language={match[1]}
          showLineNumbers
          theme={dracula}
          wrapLines
          {...props}
        />
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  }}
/>

      </div>
      <div
    
      >
   
        <div style={{
          display: 'flex', alignItems: 'center'}}>
        </div>
        <br />
        <div style={{
          display: 'flex', alignItems: 'center'}}>
        {/* <ChatInput onSend={handleButtonClick} setChatMessages={setChatMessages} setMessages={setAllMessages} messages={allMessages}/>
        {chatMessages && <Audio text={"hello I'm puffer!"}/>} */}

<div style={{ flex: '1' }}>
          <ChatInput onSend={handleButtonClick} setReset={setReset} setChatMessages={setChatMessages} setMessages={setAllMessages} messages={allMessages}/>
          { (
          <div style={{ marginLeft: '1px',marginTop: '1px' }}>
           <Tooltip text="Dictate AI Responses"> 
           <br />
           <Audio setCurrDictatedWord={setCurrDictatedWord} text={currMessage}/></Tooltip>
          </div>
        )}
        </div>
   


        </div>
        </div>

        <br />
        </div>

    </>
  );
}

// type="text"
// style={{
//   transition: 'transform 0.3s',
//   transformOrigin: 'right top',
// }}
// onMouseEnter={(e) => (e.target.style.transform = 'scale(2)')}
// onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}

export default Chatbot;
