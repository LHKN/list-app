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

// NOTE: rmb to hide access key before hosting
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
        return { ...state, images: state.images }
    }
  }

  const pageReducer = (state, action) => {
    switch (action.type) {
      case 'ADVANCE_PAGE':
        return { ...state, page: state.page + 1 }
      default:
        return state;
    }
  }

  const [pager, pagerDispatch] = useReducer(pageReducer, { page: 1 })
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
    imageDispatch({ type: 'CLEAR_IMAGES' })
  }, [searchText]);

  useEffect(() => {
    async function loadImage() {
      imageDispatch({ type: 'FETCHING_IMAGES', fetching: true })

      const url = UNSPLASH_URL + new URLSearchParams({
        client_id: MY_ACCESS_KEY,
        query: searchText,
        page: pager.page
      }).toString();

      await fetch(url)
        .then(async data => {
          const { total, total_pages, results } = await data.json();
          return results;
        })
        .then(async images => {
          console.log(images, "IMAGEURLS");

          imageDispatch({ type: 'CONCAT_IMAGES', images })
          imageDispatch({ type: 'FETCHING_IMAGES', fetching: false })

          console.log(imageData.images, "IMAGEURLS_after");
        })
        .catch(e => {
          // handle error
          imageDispatch({ type: 'FETCHING_IMAGES', fetching: false })
          return e
        })

    }
    loadImage();
  }, [searchTrigger, pager.page]);

  // implement infinite scrolling with intersection observer
  let bottomBoundaryRef = useRef(null);
  const scrollObserver = useCallback(
    node => {
      new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.intersectionRatio > 0) {
            pagerDispatch({ type: 'ADVANCE_PAGE' });
          }
        });
      }).observe(node);
    },
    [pagerDispatch]
  );
  useEffect(() => {
    if (bottomBoundaryRef.current) {
      scrollObserver(bottomBoundaryRef.current);
    }
  }, [scrollObserver, bottomBoundaryRef]);

  // lazy loads images with intersection observer
  // only swap out the image source if the new url exists
  const imagesRef = useRef(null);
  const imgObserver = useCallback(node => {
    const intObs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.intersectionRatio > 0) {
          const currentImg = en.target;
          const newImgSrc = currentImg.dataset.src;
          // only swap out the image source if the new url exists
          if (!newImgSrc) {
            console.error('Image source is invalid');
          } else {
            currentImg.src = newImgSrc;
          }
          intObs.unobserve(node); // detach the observer when done
        }
      });
    })
    intObs.observe(node);
  }, []);
  useEffect(() => {
    imagesRef.current = document.querySelectorAll('.card-img-top');
    if (imagesRef.current) {
      imagesRef.current.forEach(img => imgObserver(img));
    }
  }, [imgObserver, imagesRef, imageData.images]);

  return (
    <div className="App">
      <Search searchText={searchText} onKeywordChange={setSearchText} searchKeyword={handleTrigger} />

      {/* DISCARDED
      <div className="container">
        {imageUrls.map((image, index) => <img key={index} src={image.url} />)}
      </div> */}

      {/* <ItemList images={imageUrls} /> */}

      <div id='images' className="container">
        <div>
          {imageData.images.map((url, index) => {
            return (
              <div key={index} className="card-holder">
                <div className="card-body">
                  <img
                    src={url.urls.small}
                    alt={url.alt_description}
                    className="card-img-top" />
                </div>
                <label className="card-label" for={index}>{url.alt_description}</label>
              </div>
            )
          })}
        </div>
      </div>

      {imageData.fetching && (
        <div className="text-center bg-secondary m-auto p-3">
          <p className="m-0 text-white">Loading</p>
        </div>
      )}

      <div id='page-bottom-boundary' style={{ border: '1px solid gray' }} ref={bottomBoundaryRef} />

    </div>
  );
}

export default App;