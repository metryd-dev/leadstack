export default function HomePage() {
  return (
    <main>
      <h1>Leave your lead</h1>
      <form>
        <input name="name" placeholder="Name" />
        <input name="phone" placeholder="Phone" />
        <textarea name="message" placeholder="Message" />
        <button type="submit">Send</button>
      </form>
    </main>
  );
}
