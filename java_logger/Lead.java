package java_logger;

public class Lead {
    private String chatId;
    private String name;
    private String phone;
    private String budget;
    private String area;
    private String location;
    private String unitType;
    private String heatScore;
    private String startTime;
    private String summary;

    public Lead(String chatId, String name, String phone, String budget, String area, 
                String location, String unitType, String heatScore, String startTime, String summary) {
        this.chatId = chatId;
        this.name = name;
        this.phone = phone;
        this.budget = budget;
        this.area = area;
        this.location = location;
        this.unitType = unitType;
        this.heatScore = heatScore;
        this.startTime = startTime;
        this.summary = summary;
    }

    // Getters
    public String getChatId() { return chatId; }
    public String getName() { return name; }
    public String getPhone() { return phone; }
    public String getBudget() { return budget; }
    public String getArea() { return area; }
    public String getLocation() { return location; }
    public String getUnitType() { return unitType; }
    public String getHeatScore() { return heatScore; }
    public String getStartTime() { return startTime; }
    public String getSummary() { return summary; }
}
