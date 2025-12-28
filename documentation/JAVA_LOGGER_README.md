# Java Database Logger

This directory contains a lightweight Java microservice for logging chat data to a SQLite database.

## Requirements

1.  **Java Development Kit (JDK)**: You need Java installed (Java 11+ recommended).
    -   Check with: `java -version`
2.  **SQLite JDBC Driver**: This is a JAR file required to connect to the database.

## Setup Instructions

1.  **Download the Driver**:
    -   Download the `sqlite-jdbc` JAR file (e.g., version 3.42.0.0 or later).
    -   **Direct Link (Maven Central)**: [Download sqlite-jdbc-3.42.0.0.jar](https://repo1.maven.org/maven2/org/xerial/sqlite-jdbc/3.42.0.0/sqlite-jdbc-3.42.0.0.jar)
    -   Place the downloaded `.jar` file in this `java_logger` directory.

2.  **Compile**:
    -   Open a terminal in the parent directory (where `app.py` is).
    -   Run:
        ```bash
        javac java_logger/*.java
        ```

3.  **Run**:
    -   Run the server with the driver in the classpath.
    -   **Windows**:
        ```bash
        java -cp ".;java_logger/sqlite-jdbc-3.42.0.0.jar" java_logger.LoggerServer
        ```
    -   **Linux/Mac**:
        ```bash
        java -cp ".:java_logger/sqlite-jdbc-3.42.0.0.jar" java_logger.LoggerServer
        ```

## Usage

The server listens on `http://localhost:8080/log`. The Python application is already configured to send data to this endpoint automatically.
