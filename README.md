# Ask My Book

## Notes

Full functionality (and then some, explained below), without styling or deployment.

* Ruby version
    * 3.2.2

* System dependencies
    * openBLAS for Numo::Linalg (requires gfortran)
        * on linux: `sudo apt install gfortran`
        * on Mac: `brew install gfortran`

* Configuration
    * requires OPENAI_API_KEY environment variable

* Database creation
    * rails db:create

* Deployment instructions
    * TBD

## Architecture

### React on Rails

I elected to use Shakapacker's [React on Rails](https://github.com/shakacode/react_on_rails), because I am most comfortable with React for client side programming/UX, and it is very easy to configure with Typescript. To be honest, I chose it over other good Rails + React alternatives because I inspected the Gumroad website to figure out what they use in production. I do think it's a great pick though: the integration with Redux and ease of use with React Router is fantastic in my opinion.

I didn't adhere precisely to the original project, on both the client and server side. My methodology for computing neighbors is very different, and, in order to give users fine-grained control over the parameters I use on the server, it felt necessary to really deep dive into the process in an admin panel. I also don't want just anybody using my OpenAI credits in deployment, so I added user auth to *both* the admin panel and the regular user interface. The user interface also has one additional layer: a menu for books. This is because I wanted to demonstrate the application's ability to work across many books. After selecting a book, you are brought to a familiar page, akin to the [askmybook.com](askmybook.com) homepage.

Since I was planning to complete this in a Sunday, the admin panel currently has basically zero styling beyond what is minimally needed for functionality. I primarily wanted my UX features (but not necessarily *style*) and architecture to speak for the project, because I know Gumroad already has its own library of styles. For proof that I can actually implement styles, check out [this website](https://edcred.vercel.app) with next/react/redux, which follows an existing style formula, or [this client-only website](https://edbed.net) with react, which I designed from scratch (with some assets created by a friend). These websites are both incomplete/stealth with respect to content and prod readiness, but they are usable for demonstration purposes.

### Approximate Nearest Neighbors

Rather than calculating the dot product (equivalent to cosine similarity for normalized vectors, which the Ada embeddings are) of the query vector against every vector in the (potentially very large) dataset, it is more performant (at production scale, at least) to approximate the nearest neighbor search. One popular such method is by binary tree search via the method of random hyperplane projections. This is basically a higher-dimensional analogue to binary search, in which the vector space is recursively subdivided into two subspaces. I'm most familiar with [ANNOY](https://github.com/spotify/annoy), Spotify's open source implementation by [Erik Bernhardsson](https://erikbern.com/), which fortunately has [Ruby bindings](https://github.com/yoshoku/annoy-rb). This library saves compute at runtime by indexing a forest of random projection trees and traversing each one simultaneously with multiple processes to find neighbors.

However, ANNOY is designed to work best in hundreds of dimensions, not thousands.

### Dimensionality Reduction

Ada model embeddings are returned as normalized 1536-dimensional vectors, but those embeddings are designed to capture information that uniquely classifies inputs across the entire OpenAI training corpus (which is huge). For a single document (book), far fewer dimensions are needed to capture most (or all) of the variance across dataset elements. First, any set of m datapoints in an n-dimensional space, with `m <= n`, can be losslessly projected onto an `(m - 1)`-dimensional subspace (for an example of this lossless projection, consider 3 points in 3D space: there can only be variation along two axis because they always lie on the same 2D plane in 3D). That is to say, only the top m singular values of the dataset matrix are nonzero (subspace plus distance to origin). Second, for a document on a single topic and by a single writer, m may actually exceed to optimal number of dimensions represented in the dataset. I perform Singular Value Decomposition (SVD) to identify (1) the contribution of each dimension to variation in the dataset and (2) the transformation from the standard basis vectors to those axes (also called PCA).

![SVD](https://latex.codecogs.com/png.latex?%5CLARGE%20%5Cmathbf%7BA%7D%20%3D%20%5Cmathbf%7BU%7D%20%5Cmathbf%7BS%7D%20%5Cmathbf%7BV%7D%5ET)

Because the singular values also represent the contribution to total variance along their representative axis, we can basically softmax the diagonal of S and sum/accumulate along it until we reach the desired percentage of the original variance we wish to preserve. By default, I set this to 90%, but it can be set in the admin panel. Ideally, I would interpolate a plot of the softmaxed diagonal (a scree plot) and estimate a second derivative to identify the inflextion point where diminishing marginal returns become increasingly small, which typically exists in my experience with ada embeddings (because the matrices are low rank, the scree plots decay ~exponentially then inflect into more rapid decay to zero).

Reduced dimensionality increases distance calculation speed in inverse proportion to the reduction, and for approximate nearest neighbors search by random hyperplane projection trees, it reduces the number of trees needed for the same search logarithmically.

When new embeddings are created, they are matrix multiplied with the same projection matrix prior to any analysis.

![preprocessor](images/vector-db-process.png)

### Dequestionification (Vector Debiasing)

One of the principal concerns I have with the direct similarity approach to vector search for queriable documents is that the characteristics of the query itself are not orthogonal to the dataset: questions may be more similar to (unrelated) questions than they are to (related) answers. What you want to perform a comparison search is actually something that looks like an answer to the input query. To solve this, I collect a list of questions about the book, then train a Linear Support Vector Classifier (SVC) to find the hyperplane along which my sample questions are maximally separable from the rest of my dataset. Before performing a similarity search on user inputs, I remove the most relevant components of the SVC coefficients/weights from the query vector (after dimensionality reduction). This significantly improves querying performance in my testing, at least in qualitative terms, with a constant time complexity cost (mostly loading the weights into memory).

![dequestionification](images/dequestionifier.png)

### Natural Language Question-Answering

To actually generate answers to the user queries, I've elected to use the OpenAI ChatCompletions endpoint. The gpt-3.5-turbo model is 10x cheaper than the davinci InstructGPT model and optimized for dialogue (which this fundamentally is). With ChatCompletions, there is no few-shot "prompt-engineering" (examples) required to get useful responses, because the context can be provided directly in the "system message," and much of the few-shot example heavy-lifting is taken care of during model training via RLHF. This saves valuable context space for tokens that give the model more task-specific material to work with (from the vector search).

I specifically instruct the model to only use the provided source material in its responses and to use optionally use direct citations. This helps prevent hallucinations (for popularly known books that it knows about), while still providing users with useful references for their own further research. To keep the responses concise, I also prompt the model to use at most one of the source material passages, and I use the newline character as a stop token parameter to the model, explicitly preventing it from using more than one paragraph.

As a consequence of this (I argue, necessary,) constraint, only one passage is ever needed at most. While this *would* help to limit the context token usage (and thus, cost), it eliminates perhaps the most useful search layer: GPT-3.5-turbo's attention. Cohere recently released a search endpoint called "rerank" which basically uses an LLM to rerank search results directly. While the actual process is not (to my knowledge) fully disclosed, it looks like they're using either a cross-encoder (see the [Weaviate blog](https://weaviate.io/blog/cross-encoders-as-reranker)) or a causal language model (leveraging its emergent reasoning capabilities) to directly assess relevance against the query, bidirectionally. Implicitly, this is what we're doing in a single step during the actual prompting: letting the LLM decide which of my k-nearest-neighbors are actually the most relevant search results. Thus, it's worthwhile to at least use more context passages than you intent to cite and potentially to max out the context window (4,057 tokens, in the case of GPT-3.5).

Finally, I use the system message to present the prompt and source content, because the model is also trained to adhere more closely to its prompts than the user's. I pass the source material from the vector search as a stringified JSON, because the GPT models are pretrained primarily on code (for logical reasoning development), so they have a deep understanding of structured data. The user query is passed as a "user" message, and the "assistant" just reponds directly.

![response process](images/response-process.png)

### Further Improvements

Rather than caching plaintext queries that have already been answered, which only works if two users ask the *exact* same question verbatim, an obvious improvement would be to use a similarity threshold to identify similar cached questions. Of course, you don't want to answer *the wrong* similar question or recite an answer whose grammatical formulation doesn't match the question (initial query: "Is it raining today?"; matched query: "Is it not raining today?"; cached answer: "yes"). To solve this, while still saving API usage costs, similar but-not-identical queries could be answered without any vector-matched context, using only the cached question and answer as context. Similar questions should have similar answers, or at least use similar context compression. Based on my own experimentation, this should be pretty successful with a 0.95 threshold for similarity.
