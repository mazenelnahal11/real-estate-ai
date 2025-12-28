package java_logger;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;

public class LeadDAO {
    private static final String DB_URL = "jdbc:sqlite:leads.db";

    public LeadDAO() {
        initializeDatabase();
    }

    private void initializeDatabase() {
        String sql = "CREATE TABLE IF NOT EXISTS leads (" +
                     "chat_id TEXT PRIMARY KEY," +
                     "name TEXT," +
                     "phone TEXT," +
                     "budget TEXT," +
                     "area TEXT," +
                     "location TEXT," +
                     "unit_type TEXT," +
                     "heat_score TEXT," +
                     "start_time TEXT," +
                     "summary TEXT)";
        
        try (Connection conn = DriverManager.getConnection(DB_URL);
             Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
            System.out.println("Database initialized.");
        } catch (SQLException e) {
            System.out.println("Error initializing database: " + e.getMessage());
        }
    }

    public void saveLead(Lead lead) {
        String sql = "INSERT OR REPLACE INTO leads(chat_id, name, phone, budget, area, location, unit_type, heat_score, start_time, summary) VALUES(?,?,?,?,?,?,?,?,?,?)";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, lead.getChatId());
            pstmt.setString(2, lead.getName());
            pstmt.setString(3, lead.getPhone());
            pstmt.setString(4, lead.getBudget());
            pstmt.setString(5, lead.getArea());
            pstmt.setString(6, lead.getLocation());
            pstmt.setString(7, lead.getUnitType());
            pstmt.setString(8, lead.getHeatScore());
            pstmt.setString(9, lead.getStartTime());
            pstmt.setString(10, lead.getSummary());
            pstmt.executeUpdate();
            System.out.println("Lead saved to database: " + lead.getChatId());
        } catch (SQLException e) {
            System.out.println("Error saving lead: " + e.getMessage());
        }
    }
}
