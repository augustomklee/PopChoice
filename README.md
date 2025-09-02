# AI-Powered Movie Recommendation System

A semantic search-based movie recommendation engine that uses vector embeddings and Retrieval-Augmented Generation (RAG) to provide personalized movie suggestions based on user preferences.

https://github.com/user-attachments/assets/fcf7dd72-ad92-4c61-b51e-effd9d8f66cb



## 🎯 Project Overview

This system combines modern AI techniques to create an intelligent movie recommendation experience. By leveraging vector embeddings and semantic similarity matching, it understands user preferences at a deeper level than traditional keyword-based systems.

**Key Features:**
- Semantic understanding of user preferences through natural language
- Vector-based similarity matching for accurate recommendations
- Real-time movie suggestions with detailed descriptions
- Interactive web interface with responsive design
- PostgreSQL vector database for efficient semantic search

## 🏗️ Technical Architecture

### Core Technologies
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **AI/ML:** OpenAI GPT-4, OpenAI Embeddings API (text-embedding-3-small)
- **Database:** Supabase (PostgreSQL with pgvector extension)
- **Vector Operations:** PostgreSQL cosine similarity search
- **Text Processing:** LangChain RecursiveCharacterTextSplitter

### System Architecture Flow

```
User Input → Embedding Generation → Vector Search → Content Retrieval → LLM Processing → Movie Recommendation
```

1. **User Preference Collection**: Multi-dimensional input collection (favorite movie, new/classic preference, mood)
2. **Embedding Generation**: Convert user preferences to 1536-dimensional vectors using OpenAI's text-embedding-3-small
3. **Semantic Search**: Execute cosine similarity search in PostgreSQL vector database
4. **Content Retrieval**: Fetch most relevant movie content based on similarity scores
5. **LLM Enhancement**: Use GPT-4 to generate personalized recommendations with context
6. **Response Rendering**: Present formatted movie suggestions to users

## 🔧 Technical Implementation

### Vector Embedding Pipeline

**Embedding Generation:**
```javascript
async function createEmbedding(input) {
    const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: input.favoriteMovie + ' ' + input.newClassic + ' ' + input.funSerious,
    });
    return embeddingResponse.data[0].embedding;
}
```

**Semantic Search Function:**
```sql
create or replace function match_movies (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  similarity float
)
language sql stable
as $$
  select
    movies.id,
    movies.content,
    1 - (movies.embedding <=> query_embedding) as similarity
  from movies
  where 1 - (movies.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
```

### Database Schema

**Movies Table Structure:**
- `id` (bigint): Primary key
- `content` (text): Movie metadata and descriptions
- `embedding` (vector(1536)): High-dimensional vector representation

### RAG Implementation

The system implements Retrieval-Augmented Generation by:

1. **Retrieval Phase**: Using vector similarity to find relevant movie content
2. **Context Injection**: Passing retrieved content as context to GPT-4
3. **Generation Phase**: Creating personalized recommendations based on user preferences and retrieved context

**Context-Aware Generation:**
```javascript
async function getChatCompletion(match, input) {
  const messages = [
    {
      role: 'system',
      content: `You are an enthusiastic movie expert who loves recommending movies to people.
        You will be given two pieces of information - some context about movies and a question.
        Your main job is to formulate a detailed answer to the question using the provided context.`
    },
    // User preference messages...
    {
      role: 'user',
      content: `Context: ${match}.
        Question: A movie I would enjoy based on my preferences is.
        Format: Movie Title (Year) - Description.`
    }
  ];
  
  return await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messages,
    temperature: 0.8,
    frequency_penalty: 0.7
  });
}
```

## 🗄️ Data Processing

### Text Chunking Strategy
- **Chunk Size:** 400 characters with 100-character overlap
- **Processing:** LangChain RecursiveCharacterTextSplitter for optimal content segmentation
- **Embedding Storage:** Each chunk converted to 1536-dimensional vectors

### Movie Dataset
Current dataset includes 12 contemporary movies (2022-2023) with comprehensive metadata:
- Title, year, rating, runtime
- Genre classification
- Plot summaries
- Cast and director information
- IMDb ratings

## ⚙️ Configuration & Setup

### Environment Variables
```javascript
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_API_KEY=your_supabase_api_key
```

### Database Setup
1. Create Supabase project with pgvector extension
2. Create movies table with vector column
3. Implement match_movies function for semantic search
4. Populate database with embedded movie content

## 🚀 Performance Optimizations

### Vector Search Efficiency
- **Cosine Similarity**: Optimized PostgreSQL vector operations
- **Threshold Filtering**: Configurable similarity thresholds (default: 0.01)
- **Result Limiting**: Top-K retrieval for fast response times

### AI Model Configuration
- **Temperature**: 0.8 for creative but controlled responses
- **Frequency Penalty**: 0.7 to reduce repetitive outputs
- **Model Selection**: GPT-4 for high-quality recommendation generation

## 📊 Technical Metrics

- **Embedding Dimensions**: 1536 (OpenAI text-embedding-3-small)
- **Search Accuracy**: Cosine similarity-based matching
- **Response Time**: ~2-3 seconds for end-to-end recommendation
- **Database**: PostgreSQL with pgvector for efficient vector operations

## 🔮 Future Enhancements

### Planned Technical Improvements
- **Expanded Dataset**: Integration with larger movie databases (TMDB, IMDB)
- **User Feedback Loop**: Reinforcement learning from user ratings
- **Multi-Modal Embeddings**: Image and text-based movie representations
- **Caching Layer**: Redis for frequently accessed embeddings
- **A/B Testing**: Multiple recommendation algorithms comparison

### Advanced Features
- **Collaborative Filtering**: User-based recommendation enhancement
- **Temporal Awareness**: Release date and trending considerations
- **Genre Balancing**: Diverse recommendation algorithms
- **Explanation AI**: Detailed reasoning for recommendations

## 🛠️ Development & Deployment

### Local Development
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Run development server
npm run dev
```

### Database Migration
```javascript
// Uncomment and run once to populate database
// createMovieEmbeddings();
```

## 📈 Technical Achievements

- **Semantic Understanding**: Successfully captures nuanced user preferences
- **Vector Database Integration**: Efficient similarity search implementation
- **Real-time AI Processing**: Seamless user experience with AI-powered recommendations
- **Scalable Architecture**: Ready for dataset expansion and feature enhancement
- **Modern Web Standards**: Responsive design with vanilla JavaScript performance

This system demonstrates the power of combining vector embeddings, semantic search, and large language models to create intelligent, context-aware applications that understand and respond to user preferences in natural language.
