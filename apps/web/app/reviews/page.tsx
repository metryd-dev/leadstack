export default function ReviewsPage() {
  return (
    <main>
      <h1>Reviews</h1>
      <p>Published reviews appear here.</p>
      <form>
        <input name="author" placeholder="Your name" />
        <textarea name="content" placeholder="Your feedback" />
        <input name="rating" type="number" min={1} max={5} defaultValue={5} />
        <button type="submit">Submit review</button>
      </form>
    </main>
  );
}
