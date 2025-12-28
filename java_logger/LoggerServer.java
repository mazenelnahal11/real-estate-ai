package java_logger;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public class LoggerServer {
    private static LeadDAO leadDAO;

    public static void main(String[] args) throws IOException {
        // Initialize DAO
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            System.out.println("SQLite JDBC driver not found. Please ensure sqlite-jdbc jar is in the classpath.");
            // For now, we might fail if driver is missing, but let's proceed to setup server
        }
        
        leadDAO = new LeadDAO();

        int port = 8080;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/log", new LogHandler());
        server.setExecutor(null); // creates a default executor
        server.start();
        System.out.println("Java Logger Server started on port " + port);
    }

    static class LogHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException {
            if ("POST".equals(t.getRequestMethod())) {
                InputStream is = t.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                
                // Very simple manual JSON parsing to avoid external dependencies like Jackson/Gson
                // Assuming format: {"chatId": "...", "name": "...", ...}
                // This is fragile but meets "simple" requirement without deps
                
                String chatId = extractJsonValue(body, "chatId");
                String name = extractJsonValue(body, "name");
                String phone = extractJsonValue(body, "phone");
                String budget = extractJsonValue(body, "budget");
                String area = extractJsonValue(body, "area");
                String location = extractJsonValue(body, "location");
                String unitType = extractJsonValue(body, "unitType");
                String heatScore = extractJsonValue(body, "heatScore");
                String startTime = extractJsonValue(body, "startTime");
                String summary = extractJsonValue(body, "summary");

                Lead lead = new Lead(chatId, name, phone, budget, area, location, unitType, heatScore, startTime, summary);
                leadDAO.saveLead(lead);

                String response = "Logged";
                t.sendResponseHeaders(200, response.length());
                OutputStream os = t.getResponseBody();
                os.write(response.getBytes());
                os.close();
            } else {
                t.sendResponseHeaders(405, -1); // Method Not Allowed
            }
        }

        private String extractJsonValue(String json, String key) {
            String searchKey = "\"" + key + "\":";
            int start = json.indexOf(searchKey);
            if (start == -1) return "";
            
            start += searchKey.length();
            
            // Skip whitespace
            while (start < json.length() && (json.charAt(start) == ' ' || json.charAt(start) == ':')) {
                start++;
            }

            char quote = json.charAt(start);
            if (quote == '"') {
                start++;
                int end = json.indexOf("\"", start);
                // Handle escaped quotes if necessary, but keeping it simple
                return json.substring(start, end);
            } else {
                // Number or null or boolean
                int end = start;
                while (end < json.length() && json.charAt(end) != ',' && json.charAt(end) != '}') {
                    end++;
                }
                return json.substring(start, end).trim();
            }
        }
    }
}
