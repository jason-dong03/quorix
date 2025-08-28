// src/App.tsx
import { Button, Container, Navbar } from "react-bootstrap";

function App() {
  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#">Quorix</Navbar.Brand>
        </Container>
      </Navbar>

      <Container className="container mt-4">
        <div className="row">
          <h1>Quorix Login</h1>
        <Button variant="primary">Login with Google</Button>
        </div>
        
      </Container>
    </>
  );
}

export default App;
