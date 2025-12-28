# Object-Oriented Programming (OOP) Analysis: Java Logger Service

## 1. Overview
The `java_logger` module is a microservice designed to act as a secondary logging sink for the Real Estate Dashboard. It receives JSON payloads via HTTP POST and persists them to an SQLite database. The architecture strictly follows **Object-Oriented Design Principles**.

---

## 2. Class-Level Analysis

### A. `Lead.java` (The Model)
**Role**: Data Transfer Object (DTO) / Domain Model.
**OOP Principles Applied**:
- **Encapsulation**: All fields (`chatId`, `name`, etc.) are declared `private`. Access is strictly controlled via `public` getter methods. This protects the internal state from unauthorized modification.
- **Abstraction**: It models a real-world entity ("Sales Lead") as a discrete object, abstracting the complexity of the person into defined attributes.

```java
// Example of Encapsulation
private String name;
public String getName() { return name; }
```

### B. `LeadDAO.java` (The Data Access Object)
**Role**: Persistence Layer.
**OOP Principles Applied**:
- **Single Responsibility Principle (SRP)**: This class has one job—handling database operations. It does not care about HTTP requests or JSON parsing.
- **Information Hiding**: The database connection string (`DB_URL`) and the initialization logic (`initializeDatabase()`) are `private`. The outside world only sees the simple `saveLead(Lead lead)` interface.
- **Cohesion**: All SQL-related logic is highy cohesive within this single class.

### C. `LoggerServer.java` (The Controller)
**Role**: Entry Point & HTTP Server.
**OOP Principles Applied**:
- **Polymorphism**: The inner class `LogHandler` implements the `HttpHandler` interface (`implements HttpHandler`). This allows the underlying HTTP server to treat it generically as a handler, adhering to the Liskov Substitution Principle concept (substituting interface implementation).
- **Composition**: The Server *has-a* DAO. It composes the `LeadDAO` to delegate persistence tasks, rather than inheriting from it.

---

## 3. Design Patterns Identified

1.  **DAO Pattern**: `LeadDAO` separates the business/service layer (`LoggerServer`) from the data persistence layer (SQLite). This allows the database logic to change without affecting the server code.
2.  **POJO (Plain Old Java Object)**: `Lead.java` follows the POJO convention, making it easy to serialize/deserialize and pass around.
3.  **Singleton (Implied)**: The `LeadDAO` instance in `LoggerServer` is static and instantiated once (`private static LeadDAO leadDAO`), acting effectively as a Singleton for the application lifecycle.

---

## 4. Critique & Future Improvements

### Strengths
- **Clean Separation of Concerns**: The separation between Data (Lead), Logic (DAO), and Transport (Server) is excellent.
- **Readability**: Code is strictly typed and self-documenting.

### Weaknesses (OOP Perspective)
- **Tight Coupling**: `LoggerServer` explicitly calls `new LeadDAO()`. In a strict OOP/Enterprise environment, **Dependency Injection (DI)** would be used to pass the DAO instance, allowing for easier unit testing (mocking the database).
- **Manual JSON Parsing**: While not strictly an OOP violation, the manual string manipulation in `extractJsonValue` breaks the abstraction level usually provided by a Library (like Jackson), potentially leaking implementation details (string formats) into the Controller logic.
