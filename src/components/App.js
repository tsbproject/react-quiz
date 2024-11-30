import { useEffect, useReducer } from "react";
import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishedScreen from "./FinishedScreen";
import Timer from "./Timer";
import Footer from "./Footer";

const SECS_PER_QUESTION =30;


const initialState = {
  questions: [],
  status: "loading",
  index: 0,
  answer: null,
  error: null,
  points: 0,
  highscore: 0,
  secondRemaining:null,
};

function reducer(state, action) {
  console.log("Reducer received action:", action);

  switch (action.type) {
    case 'dataReceived':
      return {
        ...state,
        questions: action.payload,
        status: "ready",
        error: null,
      };

    case 'dataFailed':
      return {
        ...state,
        status: "error",
        error: action.payload,
      };

    case 'start':
      return {
        ...state,
        status: "active",
        index: 0, // Start from the first question
        answer: null,
        secondRemaining: state.questions.length * SECS_PER_QUESTION,
      };

    case 'newAnswer':
      const question = state.questions.at(state.index);
      // Ensure answer is provided in payload
      if (action.payload == null) {
        console.error("newAnswer action missing payload.");
        return state;
      }
      return {
        ...state,
        answer: action.payload,
        points: action.payload === question.correctOption 
        ? state.points + question.points
        : state.points,
      };

      case 'nextQuestion':
        return { 
          ...state, index: state.index + 1, answer: null
          
        };

      case 'finish':
        return {...state, status: "finished", highscore:
          state.points > state.highscore ? state.points:
          state.highscore

        };

      case 'restart':
        return {...initialState, 
                questions: state.questions,
                status: "ready"
              };
        
        //  return {...state, 
        //   points:0, 
        //   highscore:0, 
        //   index:0,
        //   answer:null, s
        //   tatus:"ready",
        //  } 
        
      case 'tick':
        return {
          ...state, 
          secondRemaining: state.secondRemaining - 1,
          status: state.secondRemaining === 0 ? "finished" :
          state.status,

        }; 


    default:
      console.error(`Unknown action type: ${action.type}`);
      return state; // Return the current state for unknown actions
  }
}


export default function App() {
  const [{ questions, status, index, answer, error, points, secondRemaining, highscore }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce(
    (prev, cur) => prev + cur.points,
     0
    );

  useEffect(() => {
    fetch(`http://localhost:2000/questions`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => dispatch({ type: 'dataReceived', payload: data }))
      .catch((err) => dispatch({ type: "dataFailed", payload: err.message }));
  }, []);

  const handleStart = () => dispatch({ type: 'start' });
  const handleNewAnswer = (answer) => dispatch({ type: 'newAnswer', payload: answer });

  return (
    <div className="app">
      <Header />
      <Main>
        {status === 'loading' && <Loader />}
        {status === 'error' && <Error message={error} />}
        {status === 'ready' && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} onStart={handleStart} />
        )}
        {status === 'active' && (
          <>
          <Progress index={index} numQuestions=
          {numQuestions} 
          points={points} 
          maxPossiblePoints={maxPossiblePoints}
          answer={answer}
          />
          
          <Question
            question={questions[index]}
            dispatch={dispatch}
            answer={answer}
            onAnswer={handleNewAnswer} />
            
          <Footer>
            <Timer dispatch={dispatch} 
                   secondRemaining={secondRemaining}  
            />
            <NextButton 
            dispatch={dispatch}
            answer ={answer} 
            numQuestions={numQuestions} 
            index={index} />
          </Footer>
          </>
        )}
        {status === 'finished' && <FinishedScreen 
        points= {points} 
        maxPossiblePoints={maxPossiblePoints} 
        highscore = {highscore}
        dispatch={dispatch}
        />}
      </Main>
    </div>
  );
}
