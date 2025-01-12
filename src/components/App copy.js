import { useEffect, useReducer } from "react";
import Header from "./Header";
import Main from "./Main";
import  Loader  from "./Loader";
import  Error  from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";





 const initialState = {
  questions: [],
  
  //'Loading', 'error', 'ready', 'active', 'finished'
  status: "Loading",
  index: 0,

 };

function reducer(state, action) {
  switch(action.type) {
    case 'dataReceived':
      return {
        ...state,
        questions: action.payload,
        status: "ready",
      };
      case 'datafailed':
        return {
          ...state,
          status: "error",
        };

        case 'start':
          return {
            ...state,
            status: "active",
          };
    

        
   
      default:
      throw new Error("Action unknown");  
  }
}

export default function App() {
  const [{questions, status, index}, dispatch] = useReducer(reducer, 
    initialState);

    const numQuestions = questions.length



  useEffect(function() {
    fetch(`http://localhost:2000/questions`)
    .then((res) => res.json())
    .then((data) => dispatch({type: 'dataReceived', payload: data

    } ) ) 
    .catch((err) => dispatch({type: "datafailed"}));
  }, [])



  return <div className="app">
       <Header />

       <Main>
        {status === 'Loading' && <Loader />}
        {status === 'error' && <Error />}
        {status === 'ready' && <StartScreen 
        numQuestions = {numQuestions} dispatch={dispatch} />}
        {status === 'active' && <Question question = 
        {questions[index]} />}
        
       
       </Main>
  </div>;
  

}