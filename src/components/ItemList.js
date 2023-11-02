export default function ItemList({ imageData }) {
    return (
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
    );
}