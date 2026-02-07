export default function AdminLoginPage() {
  return (
    <main>
      <h1>Admin login</h1>
      <form>
        <input name="token" placeholder="Admin token" />
        <button type="submit">Login</button>
      </form>
    </main>
  );
}
