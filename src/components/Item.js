export default function Item({url, id}) {
    return (
        <div>
            <image src={url} alt="" />
            <label>
                {id}
            </label>
        </div>
    );
}