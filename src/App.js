import './App.css';
import React, { useEffect, useState, useReducer, useCallback, useRef } from 'react';
// import axios from 'axios';

import ItemList from './components/ItemList';
import Search from './components/Search';

// Develop a website with the following features:

// - Implement the ability to search for photos and display images that match the search text. (3 points)
// - Allow users to scroll down to load additional photos dynamically. (3 points)
// - Show a loading indication to inform users when the website is waiting for a response from the photo search API. (3 points)
// - Deploy the website to a public host for accessibility to a broader audience. (1 point)

// Hidden access key before hosting
const MY_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_MY_ACCESS_KEY;
const UNSPLASH_URL = 'https://api.unsplash.com/search/photos?';

function App() {
  const imageReducer = (state, action) => {
    switch (action.type) {
      case 'CONCAT_IMAGES':
        return { ...state, images: state.images.concat(action.images) }
      case 'FETCHING_IMAGES':
        return { ...state, fetching: action.fetching }
      case 'CLEAR_IMAGES':
        return { ...state, images: [] }
      default:
        return state;
    }
  }

  const pageReducer = (state, action) => {
    switch (action.type) {
      case 'ADVANCE_PAGE':
        return { ...state, page: state.page + 1 }
      case 'FIRST_PAGE':
        return { ...state, page: 1 }
      default:
        return state;
    }
  }

  const [pager, pagerDispatch] = useReducer(pageReducer, { page: 1 });
  const [imageData, imageDispatch] = useReducer(imageReducer, { images: [], fetching: true });
  const [searchText, setSearchText] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(false);

  const handleTrigger = () => {
    setSearchTrigger(!searchTrigger);
  };

  // DISCARDED
  // useEffect(() =>{
  //   async function loadImage(){
  //     let url = `https://api.unsplash.com/photos/?query=${searchText}client_id=${MY_ACCESS_KEY}`;
  //     const response = await fetch(url);
  //     const imageResult = await response.json();

  //     console.log(response);

  //     setImageUrls(imageResult.results.map(image => image.urls.small));
  //   }
  //   loadImage();
  // }, [searchText]);

  // TEMPLATE
  // useEffect(() => {
  //   async function loadImage() {
  //     try {
  //       const response = await axios.get('https://api.unsplash.com/search/photos', {
  //         params: {
  //           client_id: MY_ACCESS_KEY,
  //           query: searchText,
  //           // page: currentPage,
  //         },
  //       });

  //       setImageUrls(response.data.results);
  //     } catch (error) {
  //       console.error('Error fetching images:', error);
  //     }
  //   }
  //   loadImage();
  // }, [searchText]);

  useEffect(() => {
    imageDispatch({ type: 'CLEAR_IMAGES' });
    pagerDispatch({ type: 'FIRST_PAGE' });
  }, [searchTrigger]);

  useEffect(() => {
    async function loadImage() {
      imageDispatch({ type: 'FETCHING_IMAGES', fetching: true });

      const url = UNSPLASH_URL + new URLSearchParams({
        client_id: MY_ACCESS_KEY,
        query: searchText,
        page: pager.page
      }).toString();

      await fetch(url)
        .then(async data => {
          const { total, total_pages, results } = await data.json();
          await new Promise(resolve => setTimeout(resolve, (Math.random() + 1) * 1000));
          return results;
        })
        .then(async images => {
          // console.log(images, "IMAGEURLS");

          imageDispatch({ type: 'CONCAT_IMAGES', images })

          // console.log(imageData.images, "IMAGEURLS_after");
        })
        .catch(e => {
          // handle error
          imageDispatch({ type: 'FETCHING_IMAGES', fetching: false })
          return e
        })
      imageDispatch({ type: 'FETCHING_IMAGES', fetching: false })

    }
    loadImage();
  }, [searchTrigger, pager.page]);

  // implement infinite scrolling with intersection observer
  let bottomBoundaryRef = useRef(null);
  const scrollObserver = useCallback(
    node => {
      if (bottomBoundaryRef.current) bottomBoundaryRef.current.disconnect();
      bottomBoundaryRef.current = new IntersectionObserver(entries => {
        // entries.forEach(en => {
        //   if (en.isIntersecting) {
        //     pagerDispatch({ type: 'ADVANCE_PAGE' });
        //   }
        // });

        if (entries[0].isIntersecting) {
          pagerDispatch({ type: 'ADVANCE_PAGE' });
        };
      });
      if (node) bottomBoundaryRef.current.observe(node);
    },
    [pagerDispatch]
  );

  // useEffect(() => {
  //   if (bottomBoundaryRef.current) {
  //     scrollObserver(bottomBoundaryRef.current);
  //   }
  // }, [scrollObserver, bottomBoundaryRef]);

  return (
    <div className="App">
      <Search searchText={searchText} onKeywordChange={setSearchText} searchKeyword={handleTrigger} />

      {/* DISCARDED
      <div className="container">
        {imageUrls.map((image, index) => <img key={index} src={image.url} />)}
      </div> */}

      <ItemList imageData={imageData} />

      {imageData.fetching && (
        <div className="text-center bg-secondary m-auto p-3">
          <p className="m-0 text-white">Loading</p>
        </div>
      )}

      <div id='page-bottom-boundary' style={{ border: '1px solid white' }} ref={scrollObserver} />

    </div>
  );
}

export default App;