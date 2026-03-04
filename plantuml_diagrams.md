# Performance Analytics Module - UML Diagrams

Here is the PlantUML code for your Use Case Diagram and Activity Diagram. You can copy and paste this code into any PlantUML viewer (like [PlantText](https://www.planttext.com/) or the PlantUML web server) to render the diagrams.

## 1. Use Case Diagram

This diagram shows the main actors (Hotel Admin / Manager and the System) and the primary actions they perform within the Performance Analytics module.

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
actor "Hotel Admin / Manager" as Admin
actor "Automated System" as System

rectangle "Performance Analytics Module" {
  usecase "View Revenue & Occupancy Dashboard" as UC1
  usecase "Generate Predictive Forecasts" as UC2
  usecase "Monitor Anomalies & Alerts" as UC3
  usecase "Resolve Active Alerts" as UC4
  usecase "Generate Performance Reports" as UC5
  usecase "Download PDF Reports" as UC6
  
  usecase "Aggregate Daily Analytics Data" as SysUC1
  usecase "Detect Rule-Based Anomalies" as SysUC2
}

Admin --> UC1
Admin --> UC2
Admin --> UC3
Admin --> UC4
Admin --> UC5
Admin --> UC6

System --> SysUC1
System --> SysUC2

' Dependencies
UC5 <.. UC6 : <<extend>>
SysUC1 ..> SysUC2 : <<include>>
@enduml
```

## 2. Activity Diagram

This activity diagram describes the workflow of generating a dynamic performance report and downloading it as a PDF.

```plantuml
@startuml
|Admin / User|
start
:Access "Reports & Exports" Page;
:Select Report Type (Revenue, Occupancy, etc.);
:Select "From" and "To" Date Range;
:Click "Generate Report";

|Frontend System|
:Send POST Request with Parameters;
:Show Loading Spinner;

|Backend System (Node.js)|
:Receive Request in /api/reports/generate;
:Query AnalyticsDaily MongoDB Collection;
if (Data Exists in Range?) then (Yes)
  :Aggregate Summaries (Totals, Averages);
  :Format Table Rows & Chart Series;
  :Return JSON Data (Status 200);
else (No)
  :Return Empty Data Message;
endif

|Frontend System|
if (Response has Data?) then (Yes)
  :Hide Loading Spinner;
  :Render Summary Cards;
  :Render Area Chart (Recharts);
  :Render Data Preview Table;
  
  |Admin / User|
  if (Want to Download PDF?) then (Yes)
    :Click "Download PDF";
    |Frontend System|
    :Open GET /api/reports/pdf URL in New Tab;
    |Backend System (Node.js)|
    :Initialize PDFDocument (pdfkit);
    :Draw Branded Header & Report Metadata;
    :Render Summary Section;
    :Draw Table (Max 30 rows);
    :Add Pagination Footers;
    :Stream PDF Buffer to Client;
    |Frontend System|
    :Trigger File Download in Browser;
    |Admin / User|
    :Receive and Open PDF;
  else (No)
  endif
else (No)
  :Hide Loading Spinner;
  :Display "No data available" message;
endif

|Admin / User|
stop
@enduml
```
