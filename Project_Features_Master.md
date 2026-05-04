# 🏙️ UrbanPulse: Master Feature Documentation

UrbanPulse is a premium, government-grade civic engagement and digital governance ecosystem designed specifically for the state of Bihar. It bridges the gap between citizens and local authorities through transparency, AI-powered reporting, and real-time accountability.

---

## 🏛️ 1. Role-Based Department Access (RBAC)
To ensure efficiency, the platform routes issues to the correct government agencies based on categories:

*   **👮 Police Department**:
    *   Direct visibility into **Public Safety** and **Traffic Police** issues.
    *   Ability to mark areas as "Under Surveillance."
*   **🧹 Municipal Corporation (Nagar Nigam)**:
    *   Handles **Sanitation**, **Waste Management**, and **Drainage/Sewage**.
    *   Monitors garbage collection efficiency.
*   **🛣️ PWD & Roads Department**:
    *   Focuses on **Potholes**, **Flyovers**, and **Infrastructure** maintenance.
*   **⚡ Electricity Board (BSPHCL)**:
    *   Handles **Street Lighting** and dangerous high-tension wire reports.
*   **🌳 Parks & Environment**:
    *   Manages green spaces and pollution reports.
*   **👑 Admin Overlord**:
    *   Full state-wide visibility.
    *   Full state-wide visibility.
    *   Can manually **Assign/Re-route** issues between departments.
    *   Access to advanced analytics and user moderation.

---

4.  **Verified Status**: Department-resolved issues are visually marked with an official badge to build citizen trust.

---

## 🛠️ 3. Department Onboarding & ID Creation
The creation and management of department credentials are restricted to the **Super Admin (Admin Overlord)** to maintain strict security:

*   **Centralized Registry**: The Super Admin has a dedicated **"Manage Departments"** interface where they can onboard new government agencies.
*   **Unique Department ID (DID)**: Every agency is assigned a unique DID (e.g., `BIHAR-PWD-001`, `BIHAR-POL-99`). This DID is the primary key for the system to identify the official's authority.
*   **Credential Generation**: 
    1.  The Super Admin enters the **Officer's Name**, **Official Govt Email**, and selects the **Agency**.
    2.  The system generates a unique **Department ID** and secure temporary credentials.
    3.  An automated notification is sent to the official government email with login instructions.
*   **Database Mapping**: Each DID is mapped to specific reporting categories. For example, any user with a `DID` containing `PWD` is automatically granted access to the "Roads" and "Infrastructure" data streams.

---

## 👑 4. Super Admin (Admin Overlord) Access
The **Super Admin** is the highest authority in the UrbanPulse ecosystem, responsible for state-wide governance:

*   **Unified Login**: The Super Admin logs in via the official portal. The system recognizes their **Super-user status** (Master Role: `admin`, Dept: `All`).
*   **State-Wide Oversight**: Unlike department officials, the Super Admin has a "God View" of the entire state. They can see every report across all categories (Police, Roads, Water, etc.).
*   **Cross-Department Management**: 
    *   **The Power to Re-assign**: Only the Super Admin can move an issue from one department to another.
    *   **Moderation**: They can delete inappropriate reports or block fraudulent users.
*   **Advanced Analytics**: Access to the full suite of city performance metrics, including department-wise resolution speed and SLA breach heatmaps.
*   **Official Registry Management**: The exclusive power to onboard new government agencies and generate **Department IDs**.

---

## 📝 2. Advanced Civic Reporting
The core of UrbanPulse is its intuitive and powerful reporting engine:

*   **🎙️ Hindi Voice Reporting**: AI-powered speech-to-text allowing citizens to report issues by speaking in Hindi (transcribed automatically).
*   **🤖 AI Image Verification**: Simulated computer vision cross-references photos to verify they match the selected category.
*   **📍 Precision GPS Pinning**: Leaflet.js integration for exact coordinate tagging with an "Auto-Locate" feature.
*   **📸 Multi-Photo Upload**: Support for up to 3 high-resolution photos per report for better evidence.

---

## ⚖️ 3. Transparency & Accountability
UrbanPulse follows a "Transparency First" policy to build citizen trust:

*   **🆔 Unique Tracking ID**: Professional IDs (e.g., `UP-BIHAR-2024-0012`) for every report.
*   **⏳ SLA Breach Detection**: Automatic **"⚠ SLA BREACH"** alerts for issues not addressed within 48 hours.
*   **📜 Status History Timeline**: A visual audit trail (Received → Assigned → In Progress → Resolved).
*   **💬 Official Admin Notes**: Private and public notes from authorities to keep citizens informed.

---

## 🤝 4. Community & Gamification
Engaging citizens to be active participants in city building:

*   **🏆 Citizen Leaderboard**: A gamified "Podium" design for top contributors with badges like **"City Guardian."**
*   **📢 Petitions Platform**: A "Change.org" style system for large-scale infrastructure requests requiring collective signatures.
*   **⚡ Live Activity Feed**: Real-time stream of all community upvotes, comments, and resolutions.
*   **🗳️ Upvoting System**: Community-driven prioritization of urgent issues.

---

## 📊 5. Analytics & Management
Professional tools for civic administrators:

*   **📈 Interactive Charts**: Recharts integration for Category Distribution and Status Tracking.
*   **📄 Export Tools**: One-click **PDF and CSV Export** for official departmental meetings.
*   **🧹 Bulk Maintenance**: "Clear Resolved" feature for cleaning up the database.
*   **🗺️ City-Wide Heatmap**: Visual distribution of issues across the city map.

---

## ✨ 6. Premium UI/UX "Grand Polish"
A world-class user experience that feels high-end and official:

*   **🎞️ Ken Burns Hero Gallery**: Cinematic, zooming transitions featuring verified Indian heritage imagery.
*   **🫧 Glassmorphism Design**: Frosted glass effects, subtle shine animations, and premium typography (Outfit & Inter).
*   **📱 Fully Responsive**: Seamless transition between desktop dashboard and mobile-optimized views.
*   **🌍 Bilingual Engine**: Instant toggle between **Hindi and English** for universal accessibility.
*   **💬 WhatsApp Integration**: Quick-link for citizens to report or track issues via WhatsApp.

---

**Built for Bihar. Powered by the Community.**
© 2024 UrbanPulse Platform.
