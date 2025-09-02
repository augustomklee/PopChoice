import { openai, supabase } from './config.js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const submit = document.getElementById('submit');

submit.addEventListener('click', async (e) => {
    e.preventDefault();

    const favoriteMovie = document.getElementById('favorite-movie').value;
    const newClassic = document.getElementById('new-classic').value;
    const funSerious = document.getElementById('fun-serious').value;
    document.getElementById('favorite-movie').value = '';
    document.getElementById('new-classic').value = '';
    document.getElementById('fun-serious').value = '';

    main({
        favoriteMovie,
        newClassic,
        funSerious
    });
});

const goAgain = document.getElementById('go-again-btn');

goAgain.addEventListener('click', (e) => {
    e.preventDefault();
    renderForm();
});

async function main(input) { 
    try {
        const embedding = await createEmbedding(input);
        const match = await match_movies(embedding);
        const chatCompletion = await getChatCompletion(match, input);
        renderMovie({
            title: chatCompletion.split(' - ')[0],
            description: chatCompletion.split(' - ')[1]
        });
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

// Create an embedding vector representing the query
async function createEmbedding(input) {
    const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: input.favoriteMovie + ' ' + input.newClassic + ' ' + input.funSerious,
    });

    return embeddingResponse.data[0].embedding;
}

async function match_movies(embedding, matchThreshold = 0.01, matchCount = 1) {
    try {
        // Use the match_movies function in Supabase
        const { data, error } = await supabase.rpc('match_movies', {
            query_embedding: embedding,
            match_threshold: matchThreshold,
            match_count: matchCount
        });
        
        if (error) {
            console.error('Semantic search error:', error);
            console.log(data[0].similarity);
            return [];
        }

        // const match = data.map(movie => movie.content).join(', ');
        console.log('Top match:', data[0].content);
        const match = data[0].content; // Get the content of the top match
        return match;

    } catch (err) {
        console.error('Error in semantic search:', err);
        return [];
    }
}


async function getChatCompletion(match, input) {
  const messages = [
    {
      role: 'system',
      content: `You are an enthusiastic movie expert who loves recommending movies to people.
        You will be given two pieces of information - some context about movies and a question.
        Your main job is to formulate a detailed answer to the question using the provided context.
        If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer."
        Please do not make up the answer.`
    }
  ];

  if (input.favoriteMovie) {
    messages.push({
      role: 'user',
      content: `You asked me: What's your favorite movie and why? My answer is: ${input.favoriteMovie}`
    });
  }
  if (input.newClassic) {
    messages.push(
    {
      role: 'user',
      content: `You asked me: Are you in the mood for something new or a classic? My answer is: ${input.newClassic}`
    });
  }
  if (input.funSerious) {
    messages.push(
    {
      role: 'user',
      content: `You asked me: Do you wanna have fun or do you want something serious? My answer is: ${input.funSerious}`
    });
  }

  messages.push({
    role: 'user',
    content: `Context: ${match}.
        Question: A movie I would enjoy based on my preferences is.
        Format: Movie Title (Year) - Description. Don't use any quotation marks for the title and description.`
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messages,
    temperature: 0.8,
    frequency_penalty: 0.7
  });
  console.log(response.choices[0].message.content);

  return response.choices[0].message.content;
}

const movieTitle = document.getElementById('movie-title');
const movieDescription = document.getElementById('movie-description');
const userInputForm = document.getElementById('user-input-form');
const movieContainer = document.getElementById('movie-container');
function renderMovie(movie) {
    movieTitle.textContent = movie.title;
    movieDescription.textContent = movie.description;
    userInputForm.classList.add('hidden');
    movieContainer.classList.remove('hidden');
}

function renderForm() {
    userInputForm.classList.remove('hidden');
    movieContainer.classList.add('hidden');
}

// async function createMovieEmbeddings() {
//     try {
//         // Read and split the text file
//         const movieText = await fetch('movies.txt').then(res => res.text());

//     const textSplitter = new RecursiveCharacterTextSplitter({
//         chunkSize: 400,
//         chunkOverlap: 100
//     });

//     const chunkData = await textSplitter.createDocuments([movieText]);

//     const embeddings = await Promise.all(
//         chunkData.map(async (chunk) => {
//             const embedding = await openai.embeddings.create({
//                 model: 'text-embedding-3-small',
//                 input: chunk.pageContent
//             });
//             return { 
//                 text: chunk.pageContent,
//                 embedding: embedding.data[0].embedding
//             };
//         })
//     );

//     const { error } = await supabase.from('movies').insert(embeddings);
//     if (error) {
//       throw new Error('Issue inserting data into the database.');
//     }

//     return embeddings;
//     } catch (error) {
//         console.error('Error creating movie embeddings:', error);
//     }
// }

// createMovieEmbeddings();