import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';


firebase.initializeApp({
  apiKey: "AIzaSyDQVYbh2LwarawESegIKj_Bz-HSrx-arGs",
  authDomain: "samicord-efdb0.firebaseapp.com",
  projectId: "samicord-efdb0",
  storageBucket: "samicord-efdb0.appspot.com",
  messagingSenderId: "106898184026",
  appId: "1:106898184026:web:8f5de9d1354c0e14edc563"
})

const auth = firebase.auth();
const firestore = firebase.firestore(firebase);


function App() {
  // user authentication state
  const [user] = useAuthState(auth);

  // read the messages from firebase
  const messages = []
  firestore.collection('messages').get().then(docs => {
    docs.forEach(doc => {
      messages.push(doc.data());
    })
  })

  return (
    <div className='App'>
      <header>
        <p>Welcome to my chat</p>
        <div className='signout'><SignOut/></div>
      </header>
      <div className='leftbar'>

        <div className='title'>
          <h1>samicord</h1>
          <p>My discord look-alike</p>
          <a href="https://github.com/samiatoui"><img src="https://cdn-icons-png.flaticon.com/512/25/25231.png"></img></a>
        </div>

        <div className='credits'>
          created by Sami Atoui
        </div>

      </div>


      <section>
        {user ? <Chat /> :
          <div className='signin-box'>
            <div>
              <p>Sign in to post in the chat</p>
            </div>
            <SignIn />
          </div>
        }
        
      </section>
    </div>
  );
}

// sign in button
const SignIn = () => <button onClick={() => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
}}> Sign in with Google </button>


// sign out button
const SignOut = () => {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

// chat section
function Chat() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25).limitToLast(25);;

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  // send messages
  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      displayName,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });

  }

  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      <span ref={dummy}></span>
    </main>
    <div className='form-container'>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Send a message" />
        <button type="submit" disabled={!formValue}>Send</button>
      </form>
    </div>
  </>)
}

// retrieve and display chat messages
function ChatMessage(props) {
  const { text, uid, photoURL, displayName } = props.message;

  const messageClass = uid == auth.currentUser.uid ? 'sent' : 'received';


  return (
    <div className='message-wrapper'>
      <div className={`message ${messageClass}`}>
        <div className="userInfo">
          <img src={photoURL} />
        </div>
        <div className='message-details'>
          <div className='username'>{displayName} </div>
          <p>{text} </p>

        </div>
      </div >
    </div>
  )
}

export default App;
