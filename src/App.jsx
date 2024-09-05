import { useEffect, useRef, useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
    const baseUrl = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&tags=anime&limit=200&json=1`;
    const [media, setMedia] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const search = useRef('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [savedTags, setSavedTags] = useState(JSON.parse(localStorage.getItem('savedTags')) || []);
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        fetchMedia();
    }, [page, selectedTags]);

    useEffect(() => {
        localStorage.setItem('savedTags', JSON.stringify(savedTags));
    }, [savedTags]);

    function fetchMedia() {
        setLoading(true);
        const tags = selectedTags.length > 0 ? selectedTags.join('+') : search.current.value;
        axios.get(`${baseUrl}&tags=${tags}&pid=${page - 1}`, {
            headers: {
                accept: 'application/json',
            }
        }).then(response => {
            console.log(response.data);
            setMedia(response.data);
            setLoading(false);
        });
    }

    function searchMedia() {
        setPage(1);
        fetchMedia();
    }

    function searchByTag(tag) {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
    }

    function saveTag(tag) {
        if (!savedTags.includes(tag)) {
            setSavedTags([...savedTags, tag]);
        }
    }

    function openModal(post) {
        setSelectedPost(post);
    }

    function closeModal() {
        setSelectedPost(null);
    }

    function removeTag(tag) {
        setSelectedTags(selectedTags.filter(t => t !== tag));
    }

    return (
        <>
            <header>
                <input ref={search} className="inputText" type="text" placeholder="Search..."/>
                <button onClick={searchMedia}>Search</button>
            </header>
            <div className="saved-tags">
                {savedTags.map((tag, index) => (
                    <button key={index} onClick={() => searchByTag(tag)} className="tag-button">{tag}</button>
                ))}
            </div>
            <div className="selected-tags">
                {selectedTags.map((tag, index) => (
                    <span key={index} className="tag">
                        {tag}
                        <button onClick={() => removeTag(tag)}>x</button>
                    </span>
                ))}
            </div>
            <div className="media_container">
                {loading ? <p>Loading...</p> : media.map((item, index) => (
                    <div key={index} className="media-item">
                        {item.file_url.endsWith('.mp4') ? (
                            <video src={item.file_url} alt={item.tags} controls />
                        ) : (
                            <img src={item.file_url} alt={item.tags} onClick={() => openModal(item)} />
                        )}
                    </div>
                ))}
            </div>
            <div className="pagination">
                <button onClick={() => setPage(page > 1 ? page - 1 : 1)} disabled={page === 1}>Previous</button>
                <button onClick={() => setPage(page + 1)}>Next</button>
            </div>

            {selectedPost && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedPost.file_url} alt={selectedPost.tags} />
                        <p>Owner: {selectedPost.owner}</p>
                        <div className="tags">
                            {selectedPost.tags.split(' ').map((tag, index) => (
                                <span key={index} className="tag" onClick={() => searchByTag(tag)}>
                                    {tag}
                                    <button onClick={() => saveTag(tag)}>Save</button>
                                </span>
                            ))}
                        </div>
                        <button onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default App;