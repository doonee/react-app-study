import logo from './logo.svg';
import React from 'react';
import './App.css';
import Title from './components/Title'

const jsonLocalStorage = {
  setItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: (key) => {
    return JSON.parse(localStorage.getItem(key));
  },
};

const fetchCat = async (text) => {
  const OPEN_API_DOMAIN = "https://cataas.com";
  const response = await fetch(
    `${OPEN_API_DOMAIN}/cat/says/${text}?json=true`
  );
  const responseJson = await response.json();
  return `${OPEN_API_DOMAIN}/${responseJson.url}`;
};

const Form = ({ updateMainCat }) => {
  const includesHangul = (text) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/i.test(text);
  const [value, setValue] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  function handleInputChange(e) {
    const userValue = e.target.value;
    setErrorMessage("");
    if (includesHangul(userValue)) {
      setErrorMessage("한글은 입력할 수 없습니다.");
    } else {
      setValue(userValue.toUpperCase());
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (value === "") {
      setErrorMessage("빈 값으로 만들 수 없습니다.");
      return;
    }
    updateMainCat(value);
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <input
        type="text"
        name="name"
        placeholder="영어 대사를 입력해주세요"
        value={value}
        onChange={handleInputChange}
      />
      <button type="submit">생성</button>
      <p style={{ color: "red" }}>{errorMessage}</p>
    </form>
  );
};

function CatItem(props) {
  return (
    <li>
      <img src={props.img} style={{ width: "150px" }} />
    </li>
  );
}

const Favorites = ({ favorites }) => {
  if (!favorites || !favorites.length) {
    return <div style={{ marginTop: '1rem' }}>사진 위 하트를 눌러 고양이 사진을 저장해 보아요!</div>
  }

  return (
    <ul className="favorites">
      {favorites.map((cat) => (
        <CatItem img={cat} key={cat} />
      ))}
    </ul>
  );
}

const MainCard = ({ img, onHeartClick, alreadyFavorite }) => {
  const heartImg = alreadyFavorite ? "💖" : "🤍";

  return (
    <div className="main-card">
      <img src={img} alt="고양이" width="400" />
      <button onClick={onHeartClick}>{heartImg}</button>
    </div>
  );
};

const App = () => {
  const CAT1 =
    "https://upload.wikimedia.org/wikipedia/commons/3/37/YouTube_loading_symbol_2_%28stable%29.gif";
  const CAT2 =
    "https://cataas.com//cat/5e9970351b7a400011744233/says/inflearn";
  const CAT3 =
    "https://cataas.com/cat/595f280b557291a9750ebf65/says/JavaScript";

  // const [counter, setCounter] = React.useState(
  //     jsonLocalStorage.getItem("counter")
  // );
  // 로컬 스토리지를 무차별적으로 접근하지 않기 위한 리팩토링
  const [counter, setCounter] = React.useState(() => {
    return jsonLocalStorage.getItem("counter")
  });

  const [mainCat, setMainCat] = React.useState(CAT1);
  // const [favorites, setFavorites] = React.useState(
  //     jsonLocalStorage.getItem("favorites") || []
  // );

  const [favorites, setFavorites] = React.useState(() => {
    return jsonLocalStorage.getItem("favorites") || []
  });

  const alreadyFavorite = favorites.includes(mainCat);

  const counterTitle = !counter ? '' : `${counter}번째 `;

  async function setInitialCat() {
    const newCat = await fetchCat("First cat");
    setMainCat(newCat);
  }

  React.useEffect(() => {
    setInitialCat();
  }, []);

  async function updateMainCat(value) {
    setMainCat(CAT1);

    const newCat = await fetchCat(value);

    setMainCat(newCat);

    // 카운터 업데이트
    // 이 방식으로 하면 무작위 클릭시 setCount 와 localStorage 값이 일치하지 않을 수 있다.
    // const nextCounter = counter + 1;
    // setCounter(nextCounter);
    // jsonLocalStorage.setItem("counter", nextCounter);

    // 함수 방식을 활용하면 값이 일치한다.
    // prev : 기존의 값
    setCounter((prev) => {
      const nextCounter = prev + 1;
      jsonLocalStorage.setItem("counter", nextCounter);
      return nextCounter;
    })
  }

  function handleHeartClick() {
    const nextFavorites = [...favorites, mainCat];
    setFavorites(nextFavorites);
    jsonLocalStorage.setItem("favorites", nextFavorites);
  }

  return (
    <div>
      <Title>{counterTitle}고양이 가라사대</Title>
      <Form updateMainCat={updateMainCat} />
      <MainCard img={mainCat} onHeartClick={handleHeartClick} alreadyFavorite={alreadyFavorite} />
      <Favorites favorites={favorites} />
    </div>
  );
};

export default App;
