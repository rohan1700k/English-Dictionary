import React, { useMemo, useState, useEffect } from 'react';
import Result from './Result';
import "../src/index.css";

const synth = window.speechSynthesis;

const App = () => {
  const [voiceSelected, setVoiceSelected] = useState("Microsoft Heera - English (India)");
  const [text, setText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState("");
  const [meanings, setMeanings] = useState([]);
  const [phonetics, setPhonetics] = useState([]);
  const [word, setWord] = useState("");
  const [error, setError] = useState("");

  const dictionaryApi = (text) => {
    let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${text}`;
    fetch(url)
      .then(res => res.json())
      .then(result => {
        console.log(result);
        if (result.title && result.title === "No Definitions Found") {
          setError(result.title);
          setMeanings([]);
          setPhonetics([]);
          setWord("");
        } else {
          setMeanings(result[0].meanings);
          setPhonetics(result[0].phonetics);
          setWord(result[0].word);
          setError("");
        }
      })
      .catch(err => setError(err));
  };

  const reset = () => {
    setIsSpeaking("");
    setError("");
    setMeanings([]);
    setPhonetics([]);
    setWord("");
  };

  useEffect(() => {
    if (!text.trim()) return reset();

    const debounce = setTimeout(() => {
      dictionaryApi(text);
    }, 1000);

    return () => clearTimeout(debounce);
  }, [text]);

  const voices = useMemo(() => {
    return synth.getVoices();
  }, []);

  const startSpeech = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(voice => voice.name === voiceSelected);
    console.log(utterance);
    utterance.voice = voice;
    synth.speak(utterance);
  };

  const handleSpeech = () => {
    if (!text.trim()) return;
    if (!synth.speaking) {
      startSpeech(text);
      setIsSpeaking("speak");
    } else {
      synth.cancel();
    }

    setInterval(() => {
      if (!synth.speaking) {
        setIsSpeaking("");
      }
    }, 100);
  };

  return (
    <div className='container'>
      <h1>English Dictionary</h1>
      <form>
        <div className='row'>
          <textarea
            name=''
            id=''
            cols={30}
            rows={4}
            placeholder='Enter Text'
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className='voices-icons'>
            <div className='select-voices'>
              <select value={voiceSelected} onChange={(e) => setVoiceSelected(e.target.value)}>
                {voices.map(each => (
                  <option key={each.name} value={each.name}>
                    {each.name}
                  </option>
                ))}
              </select>
            </div>
            <i onClick={handleSpeech} className={`fa-solid fa-volume-high ${isSpeaking}`} />
          </div>
        </div>
      </form>
      {text.trim() !== "" && !error ? (
        <Result word={word} phonetics={phonetics} meanings={meanings} setText={setText} />
      ) : (
        <div>{error}</div>
      )}
    </div>
  );
};

export default App;
