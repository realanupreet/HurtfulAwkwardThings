import "./styles.css";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
const firebaseConfig = {
  apiKey: "AIzaSyCBQ4dRltyhDtsJhrAw1Ax92TV8RCTWm5w",
  authDomain: "notevenlinkedin.firebaseapp.com",
  projectId: "notevenlinkedin",
  storageBucket: "notevenlinkedin.appspot.com",
  messagingSenderId: "517129053798",
  appId: "1:517129053798:web:7c8dafc5e2710a2d44efa7",
  measurementId: "G-51QQ8YD5CG"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();

export default function App() {
  const [currentuser, setCurrentuser] = useState(() => auth.currentUser);
  const [initaializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentuser(user);
      } else {
        setCurrentuser(null);
      }
      if (initaializing) {
        setInitializing(false);
      }
    });
    return unsub;
  }, []);
  const signIn = () => {
    const provider = new GoogleAuthProvider();
    auth.useDeviceLanguage();

    try {
      signInWithPopup(auth, provider);
    } catch (err) {
      console.log(err);
    }
  };
  const signout = async () => {
    try {
      await signOut(auth);
    } catch (err) {}
  };
  if (initaializing)
    return (
      <>
        <div className="App">loading....</div>{" "}
      </>
    );
  return (
    <div className="App">
      {currentuser ? (
        <>
          <button onClick={signout}>Sign Out</button>
          <p>
            welcome to chat!
            <span role="img" aria-label="handshake">
              🤝
            </span>
            {currentuser.displayName}
          </p>
          <Channel user={currentuser} />
        </>
      ) : (
        <button onClick={signIn}>Sign in with google</button>
      )}
    </div>
  );
}
const Channel = ({ user = null }) => {
  const inputRef = useRef();
  const db = getFirestore();
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if (db) {
      const q = query(
        collection(db, "messages"),
        orderBy("createdAt"),
        limit(10000)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        );
      });
      return unsub;
    }
  }, [db]);
  const handleOnSubmit = async () => {
    const collectionRef = collection(db, "messages");
    const text = inputRef.current.value;
    const createdAt = serverTimestamp();
    const displayName = user.displayName;
    const photoUrl = user.photoURL;
    const uid = user.uid;
    const payload = { text, createdAt, displayName, photoUrl, uid };
    // console.log(payload);
    await addDoc(collectionRef, payload);
  };
  return (
    <div className="Channel">
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            {/* <img src={message.photoUrl} /> */}
            <p>
              {message.displayName} : {message.text}{" "}
            </p>
          </li>
        ))}
      </ul>
      <form>
        <input ref={inputRef} type="text" />
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            handleOnSubmit();
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};
