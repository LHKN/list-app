export default function Search({ searchText, onKeywordChange, searchKeyword }) {
    return (
        <div className="search-bar">
            <input
                type="text"
                className="search-text"
                value={searchText}
                onChange={(e) => onKeywordChange(e.target.value)}
            />
            <button className="search-btn" onClick={() => searchKeyword(searchText)}>
                Search
            </button>
        </div>
    );
}