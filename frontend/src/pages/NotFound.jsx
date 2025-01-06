import "../styles/NotFound.css";

function NotFound() {
    return (
        <div className="container">
            <header className="header">
                <img src="/care.png" alt="Care logo" />
            </header>
            <h1>404 Not Found</h1>
            <p>The page you're looking for doesn't exist!</p>
        </div>
    );
}

export default NotFound;