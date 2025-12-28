# Core System Architecture (Java Rewrite)

This document outlines the three most critical components of the system rewritten as Java classes. These classes represent the **Data Model**, **AI Intelligence**, and **Business Logic** layers.

---

## 1. The Core Entity: `Lead.java`

This class represents the heart of the application: the potential client. It maps directly to the database schema and structure extracted by the AI.

**Relationships**:
- Used by `LeadManager` for storage and retrieval.
- Produced by `LLMService` which extracts this data from unstructured chat.

```java
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Lead {
    // Unique Identifier
    private String chatId;
    
    // Personal Details
    private String name;
    private String phone;
    
    // Real Estate Preferences
    private BigDecimal budget;
    private String location;
    private String compound;    // Specific project context
    private String unitType;    // e.g., "Apartment", "Villa"
    private Double area;        // In square meters
    
    // AI-Derived Metrics
    private int heatScore;      // 0-100 score indicating lead quality
    private String summary;     // AI-generated conversation summary
    
    // Actionable Status
    private boolean callRequested;
    private LocalDateTime bestCallTime; // NULL unless explicitly requested
    
    // Metadata
    private LocalDateTime createdAt;

    // Constructor
    public Lead(String chatId) {
        this.chatId = chatId;
        this.createdAt = LocalDateTime.now();
        this.heatScore = 0; // Default
    }

    // Getters and Setters
    public String getChatId() { return chatId; }
    public void setChatId(String chatId) { this.chatId = chatId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }

    public int getHeatScore() { return heatScore; }
    public void setHeatScore(int heatScore) { this.heatScore = heatScore; }

    public boolean isCallRequested() { return callRequested; }
    public void setCallRequested(boolean callRequested) { this.callRequested = callRequested; }

    public LocalDateTime getBestCallTime() { return bestCallTime; }
    public void setBestCallTime(LocalDateTime bestCallTime) { this.bestCallTime = bestCallTime; }
    
    // ... Additional getters/setters for location, phone, etc.
}
```

---

## 2. The Intelligence Layer: `LLMService.java`

This service encapsulates the interactions with Large Language Models (Gemini, Mistral, etc.). It is responsible for conversation management and structured data extraction.

**Relationships**:
- Attributes: `AIClient` (Interface for API calls).
- Methods return: `String` (replies) and `Lead` (extracted data).

```java
import java.util.List;
import java.util.concurrent.CompletableFuture;

public class LLMService {
    
    // Attribute: Abstracted client for AI API calls (Gemini/HuggingFace)
    private final AIClient aiClient;
    
    public LLMService(AIClient aiClient) {
        this.aiClient = aiClient;
    }

    /**
     * Generates a contextual response to the user.
     * @param lastMessage The latest user input.
     * @param chatHistory List of previous context messages (User + Assistant).
     * @param availableCompounds Context data about real estate projects.
     * @return Natural language response.
     */
    public String generateResponse(String lastMessage, List<String> chatHistory, String availableCompounds) {
        String historyBlock = String.join("\n", chatHistory);
        
        String prompt = String.format("""
            You are a real estate assistant.
            Context: %s
            History: %s
            User: %s
            
            Respond naturally in 2-3 sentences.
            """, availableCompounds, historyBlock, lastMessage);

        return aiClient.generateText(prompt);
    }

    /**
     * Extracts structured lead data from the unstructured conversation.
     * @param fullTranscript The entire chat log.
     * @return A populated Lead object.
     */
    public Lead extractLeadData(String chatId, String fullTranscript) {
        String extractionPrompt = """
            Extract JSON: name, phone, budget, location, heat_score (0-100), 
            call_requested (boolean), best_call_time (ISO8601 or null).
            From: 
            """ + fullTranscript;

        String jsonResponse = aiClient.generateText(extractionPrompt);
        return JsonParser.parseLead(chatId, jsonResponse);
    }

    /**
     * Generates a concise professional summary.
     */
    public String generateSummary(String fullTranscript) {
        return aiClient.generateText("Summarize this real estate chat in 30 words: " + fullTranscript);
    }
}
```

---

## 3. The Business Logic: `LeadManager.java`

This class handles the core dashboard analytics, database persistence, and metrics calculation. It mimics the functionality of `leadService.js`.

**Relationships**:
- Attributes: `DatabaseConnection`.
- Operates on: Collections of `Lead` objects.
- Returns: `DashboardStats` (DTO).

```java
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

public class LeadManager {
    
    private final DatabaseConnection db;

    public LeadManager(DatabaseConnection db) {
        this.db = db;
    }

    /**
     * Calculates real-time dashboard metrics (Revenue, Heat Score, Counts).
     * @return A Stats object containing heavy calculations.
     */
    public DashboardStats getDashboardMetrics() {
        List<Lead> allLeads = db.findAllLeads();
        
        // 1. Calculate Projected Revenue (Sum of all budgets)
        BigDecimal totalRevenue = allLeads.stream()
            .map(Lead::getBudget)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Count "Hot" Leads (Score > 75)
        long hotLeadsCount = allLeads.stream()
            .filter(l -> l.getHeatScore() > 75)
            .count();

        // 3. Calculate Average Heat Score
        double avgHeatScore = allLeads.stream()
            .mapToInt(Lead::getHeatScore)
            .average()
            .orElse(0.0);

        return new DashboardStats(
            allLeads.size(),
            totalRevenue,
            hotLeadsCount,
            (int) Math.round(avgHeatScore)
        );
    }

    /**
     * Persists or Updates a lead after a chat session.
     */
    public void saveOrUpdateLead(Lead lead) {
        if (lead.isCallRequested() && lead.getBestCallTime() == null) {
            // Business Logic: If call requested but no time, flag for immediate follow-up
            System.out.println("Alert: Call requested without time for " + lead.getName());
        }
        db.save(lead);
    }
    
    // Nested DTO for Dashboard Stats
    public record DashboardStats(
        int totalLeads, 
        BigDecimal projectedRevenue, 
        long hotLeads, 
        int avgHeatScore
    ) {}
}
```
