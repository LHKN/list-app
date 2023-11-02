import Item from "../components/Item";

export default function ItemList({ images }) {
    return (
        <div className="container">
            {images.map((url) => <img key={url.id} src={url.urls.small} alt={url.alt_description} />)}
        </div>
    );
}