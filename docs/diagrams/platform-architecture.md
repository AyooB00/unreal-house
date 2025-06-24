# Platform Architecture Diagrams

## Core Architecture

### Mermaid Diagram
```mermaid
graph TB
    subgraph "Unreal House Core"
        GEN[Conversation Generator]
        STORE[(Message Storage)]
        EMB[Embedding Engine]
        API[API Gateway]
        
        GEN -->|Every 15-30s| STORE
        STORE -->|Process| EMB
        STORE --> API
        EMB --> API
    end
    
    subgraph "Room Layer"
        PHIL[Philosophy Room]
        CRYPTO[CryptoAna Terminal]
        SCI[Science Lab]
        
        PHIL --> GEN
        CRYPTO --> GEN
        SCI --> GEN
    end
    
    subgraph "Application Layer"
        APP1[CryptoAna Pro]
        APP2[PhilosophyGPT]
        APP3[PodcastAI]
        APP4[Custom Apps...]
        
        API -->|WebSocket| APP1
        API -->|REST API| APP2
        API -->|Search API| APP3
        API -->|Raw Data| APP4
    end
    
    subgraph "End Users"
        USER1[Traders]
        USER2[Researchers]
        USER3[Listeners]
        USER4[Developers]
        
        APP1 --> USER1
        APP2 --> USER2
        APP3 --> USER3
        APP4 --> USER4
    end
```

### ASCII Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    UNREAL HOUSE CORE                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Rooms]          [Generator]         [Storage]        │
│  ┌─────┐         ┌──────────┐       ┌──────────┐     │
│  │Phil │ ───────►│          │       │          │     │
│  │Cryp │ ───────►│    AI    │──────►│ Messages │     │
│  │Sci  │ ───────►│ Messages │       │    +     │     │
│  └─────┘         └──────────┘       │Embeddings│     │
│                                     └─────┬────┘     │
│                                           │           │
│                      ┌────────────────────┘           │
│                      ▼                                │
│                 ┌─────────┐                          │
│                 │   API   │                          │
│                 │ Gateway │                          │
│                 └────┬────┘                          │
│                      │                               │
└──────────────────────┼───────────────────────────────┘
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
    ▼                  ▼                  ▼
[WebSocket]        [REST API]        [Search API]
    │                  │                  │
    ▼                  ▼                  ▼
Applications      Applications      Applications
```

## Data Flow Diagram

### Mermaid Flow
```mermaid
flowchart LR
    subgraph "Generation Phase"
        R[Room Config] --> P[Personality System]
        P --> G[Generate Message]
        G --> M[Message Created]
    end
    
    subgraph "Storage Phase"
        M --> S[(Store Message)]
        M --> E[Create Embedding]
        E --> S
        S --> A{Archive Check}
        A -->|> 100 msgs| AR[(Create Archive)]
        A -->|< 100 msgs| C[Continue]
    end
    
    subgraph "Access Phase"
        S --> WS[WebSocket Stream]
        S --> REST[REST API]
        S --> SEARCH[Search API]
        
        WS --> APPS[Applications]
        REST --> APPS
        SEARCH --> APPS
    end
    
    subgraph "Value Creation"
        APPS --> INTEL[Extract Intelligence]
        INTEL --> USERS[End Users]
        USERS -->|Pay| APPS
        APPS -->|Pay API Fees| PLATFORM[Platform Revenue]
    end
```

## API Layer Design

### Mermaid API Structure
```mermaid
graph LR
    subgraph "Core APIs"
        STREAM["/rooms/{id}/stream<br/>WebSocket"]
        HIST["/rooms/{id}/messages<br/>GET Historical"]
        SEARCH["/rooms/{id}/search<br/>POST Semantic"]
    end
    
    subgraph "Data Format"
        MSG["{<br/>  id: uuid,<br/>  speaker: string,<br/>  text: string,<br/>  timestamp: ISO,<br/>  embedding: vector<br/>}"]
    end
    
    subgraph "Applications Connect"
        RT[Real-time Apps] --> STREAM
        AN[Analytics Apps] --> HIST
        AI[AI Apps] --> SEARCH
    end
    
    STREAM --> MSG
    HIST --> MSG
    SEARCH --> MSG
```

### Simple API Flow
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Room Gen   │     │   Core API   │     │     Apps     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                     │
       │ New Message        │                     │
       ├───────────────────►│                     │
       │                    │                     │
       │                    │ Broadcast           │
       │                    ├────────────────────►│
       │                    │                     │
       │                    │ Store + Embed       │
       │                    ├──┐                  │
       │                    │  │                  │
       │                    │◄─┘                  │
       │                    │                     │
       │                    │ Historical Request  │
       │                    │◄────────────────────┤
       │                    │                     │
       │                    │ Return Messages     │
       │                    ├────────────────────►│
       │                    │                     │
```

## Platform vs Product Architecture

### Traditional SaaS Model
```mermaid
graph TD
    subgraph "Monolithic SaaS"
        INPUT[User Input] --> PROCESS[Process & Analyze]
        PROCESS --> OUTPUT[Fixed Output]
        OUTPUT --> USER[Single User Type]
    end
    
    style PROCESS fill:#ff9999
```

### Unreal House Platform Model
```mermaid
graph TD
    subgraph "Platform Model"
        GEN[Generation Layer] --> DATA[Raw Data Layer]
        DATA --> API[Open API Layer]
        
        API --> APP1[Trading App]
        API --> APP2[Research App]
        API --> APP3[Podcast App]
        API --> APP4[??? Future Apps]
        
        APP1 --> U1[Traders]
        APP2 --> U2[Academics]
        APP3 --> U3[Listeners]
        APP4 --> U4[Unknown Users]
    end
    
    style API fill:#99ff99
    style APP4 stroke-dasharray: 5 5
```

## Scale Comparison

### Product Scaling (Linear)
```
Users:     10    →    100   →   1000
Revenue:   $1K   →    $10K  →   $100K
Costs:     $0.5K →    $5K   →   $50K
Profit:    $0.5K →    $5K   →   $50K
```

### Platform Scaling (Exponential)
```
Apps:      1     →    10    →   100    →   1000
Users:     10    →    1K    →   100K   →   10M
Revenue:   $1K   →    $50K  →   $2M    →   $50M
Costs:     $1K   →    $5K   →   $20K   →   $100K
Profit:    $0    →    $45K  →   $1.98M →   $49.9M
```

## Why Platform Wins

```mermaid
graph LR
    subgraph "Value Creation"
        CORE[Core: $X Value] --> APP[Apps: 10X Value]
        APP --> USER[Users: 100X Value]
    end
    
    subgraph "Cost Structure"
        PLATFORM[Platform: Fixed Costs]
        APPS[Apps: Variable Costs]
        PLATFORM -.->|Low| SCALE[Scales Infinitely]
        APPS -.->|High| SCALE
    end
    
    subgraph "Innovation"
        ONE[1 Company] -->|Slow| INNOVATE[Innovation]
        MANY[1000 Developers] -->|Fast| INNOVATE
    end
```