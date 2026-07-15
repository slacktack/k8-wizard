import type { Architecture } from '../components/diagram/ArchitectureDiagram';

export interface TradeOff {
  approach: string;
  pros: string[];
  cons: string[];
}

export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'intermediate' | 'advanced' | 'expert';
  estimatedTime: string;
  problem: string;
  requirements: string[];
  architecture: Architecture;
  deepDive: { title: string; body: string }[];
  tradeOffs: TradeOff[];
  k8sMapping: string[];
  keyTakeaways: string[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'url-shortener',
    title: 'Design a URL Shortener',
    subtitle: 'Like TinyURL — scalable, fast redirects, analytics',
    difficulty: 'intermediate',
    estimatedTime: '45 min',
    problem: 'Design a URL shortening service like TinyURL or bit.ly. Users submit a long URL and receive a short alias. When someone visits the short URL, they are redirected to the original. The system should handle billions of redirects per month with low latency.',
    requirements: [
      'Generate a unique, short alias for every long URL (6-7 characters)',
      'Redirect from short URL to long URL in <10ms',
      'Handle 100M+ URLs stored, 1B+ redirects/month',
      'Support custom aliases for premium users',
      'Track analytics: click counts, referrers, timestamps',
      'High availability — no single point of failure',
    ],
    architecture: {
      id: 'url-shortener',
      name: 'URL Shortener',
      blurb: 'A write-heavy system at the edge. Writes create short URLs; reads handle billions of redirects. Cache is critical.',
      tiers: [
        { label: 'Client', nodes: [{ label: 'Browser', sub: 'User submits URL / visits short link', kind: 'external' }] },
        { label: 'Edge', nodes: [
          { label: 'CDN', sub: 'Cache redirects edge-side', kind: 'ingress' },
          { label: 'API Gateway', sub: 'Rate limiting · auth', kind: 'ingress' },
        ] },
        { label: 'Service', nodes: [
          { label: 'Write API', sub: 'Create short URLs', kind: 'workload' },
          { label: 'Redirect Service', sub: 'Stateless · heavy read', kind: 'workload' },
          { label: 'Analytics', sub: 'Async click processing', kind: 'workload' },
        ] },
        { label: 'Cache', nodes: [{ label: 'Redis Cluster', sub: 'Hot URLs · <1ms reads', kind: 'data' }] },
        { label: 'Data', nodes: [
          { label: 'PostgreSQL', sub: 'URL mappings · sharded', kind: 'data' },
          { label: 'Kafka', sub: 'Click event stream', kind: 'data' },
        ] },
      ],
    },
    deepDive: [
      { title: 'Key Generation Strategy', body: 'Use Base62 encoding (a-z, A-Z, 0-9 = 62 chars). With 7 characters, we get 62^7 = 3.5 trillion unique combinations. Two approaches: (1) Distributed ID generator (Snowflake) → hash → Base62, or (2) Pre-generate batches of keys in a key-database service. Pre-generation avoids collisions and is simpler.' },
      { title: 'Redirect Flow', body: '1) Browser hits short URL → DNS resolves to CDN edge. 2) CDN checks edge cache. 3) Miss: request goes to Redirect Service. 4) Service checks Redis cache. 5) Miss: queries PostgreSQL by hash. 6) Returns 301/302 redirect with original URL. 7) Async: emit click event to Kafka for analytics.' },
      { title: 'Database Sharding', body: 'Shard PostgreSQL on the hash of the short key. With 100M URLs and 32 shards, each shard holds ~3M rows — easily cached. Use consistent hashing to minimize rebalancing when adding shards. Read replicas per shard handle the 99% read workload.' },
      { title: 'Caching Strategy', body: 'Two-tier cache: L1 = CDN (edge, TTL 1 hour for popular URLs), L2 = Redis Cluster (in-memory, TTL 24 hours, LRU eviction). ~80% of traffic hits CDN, ~15% hits Redis, only ~5% hits the database. Cache miss: write-through from DB to Redis asynchronously.' },
    ],
    tradeOffs: [
      { approach: 'Base62 vs MD5 hash', pros: ['Short, human-readable', 'Collision-free with key DB', 'URL-safe characters'], cons: ['Need a separate key-gen service', 'Sequential keys could be guessed'] },
      { approach: '301 vs 302 redirect', pros: ['301: Browsers cache — less load', '302: Can track real-time analytics'], cons: ['301: Hard to update if URL changes', '302: More traffic to redirect service'] },
      { approach: 'SQL vs NoSQL', pros: ['SQL: ACID, relational queries for analytics', 'Familiar tooling'], cons: ['NoSQL (Cassandra): Better write scalability', 'Weaker consistency model'] },
    ],
    k8sMapping: ['Write API → Deployment + ClusterIP Service', 'Redirect Service → Deployment + HPA (CPU-based)', 'Redis → StatefulSet with PVC (or Redis Operator)', 'PostgreSQL → StatefulSet + PVC + read replicas', 'Kafka → StatefulSet (Kafka Operator/Strimzi)', 'API Gateway → Ingress (NGINX) with rate limiting'],
    keyTakeaways: ['Read-heavy systems need aggressive caching at every tier', 'Key generation strategy affects scalability and security', 'Async event processing decouples critical path from analytics', 'CDN caching reduces infrastructure costs for global audiences'],
  },
  {
    id: 'chat-system',
    title: 'Design WhatsApp / Messenger',
    subtitle: 'Real-time messaging — 1:1, groups, delivery status, online presence',
    difficulty: 'advanced',
    estimatedTime: '60 min',
    problem: 'Design a real-time messaging system like WhatsApp or Facebook Messenger. Users send messages to individuals or groups. Messages must be delivered with low latency, support read receipts, typing indicators, and online presence. The system must handle billions of messages daily.',
    requirements: [
      'Send and receive messages in <100ms for 1:1 chats',
      'Support group chats up to 256 participants',
      'Delivery status: sent, delivered, read',
      'Online/offline presence and typing indicators',
      'End-to-end encryption for message content',
      'Media sharing (images, videos, documents)',
    ],
    architecture: {
      id: 'chat-system',
      name: 'WhatsApp-like Messenger',
      blurb: 'Real-time bidirectional messaging using WebSocket persistent connections. Messages are stored durably and synced across devices.',
      tiers: [
        { label: 'Client', nodes: [{ label: 'Mobile/Web', sub: 'WebSocket + HTTP', kind: 'external' }] },
        { label: 'Edge', nodes: [{ label: 'LB / Gateway', sub: 'WebSocket termination', kind: 'ingress' }] },
        { label: 'Real-time', nodes: [
          { label: 'Connection Manager', sub: 'WebSocket hub per region', kind: 'workload' },
          { label: 'Presence Service', sub: 'Online status · heartbeats', kind: 'workload' },
        ] },
        { label: 'Service', nodes: [
          { label: 'Message Service', sub: 'Store & forward', kind: 'workload' },
          { label: 'Group Service', sub: 'Group membership', kind: 'workload' },
          { label: 'Media Service', sub: 'Upload/resize/store', kind: 'workload' },
        ] },
        { label: 'Data', nodes: [
          { label: 'Cassandra', sub: 'Message storage', kind: 'data' },
          { label: 'Redis', sub: 'Presence · sessions', kind: 'data' },
          { label: 'S3/Object Store', sub: 'Media files', kind: 'data' },
        ] },
      ],
    },
    deepDive: [
      { title: 'WebSocket Connection Management', body: 'Clients maintain a persistent WebSocket connection to the Connection Manager. Each region has its own pool of WebSocket servers. A global load balancer routes users to the nearest region. If a connection drops, clients reconnect with exponential backoff. Connections are stateful — use sticky sessions via the load balancer.' },
      { title: 'Message Flow (1:1)', body: '1) Alice sends message via WebSocket. 2) Connection Manager routes to Message Service. 3) Message Service writes to Cassandra (partitioned by conversation_id). 4) If Bob is connected in the same region, push via WebSocket. 5) If Bob is in a different region, route through inter-region message bus (Kafka). 6) If Bob is offline, store for later delivery (push notification).' },
      { title: 'Group Chat Delivery', body: 'Fan-out on write: when Alice sends to a 256-person group, the Message Service writes one copy per recipient to their inbox (or one copy per conversation with a read index). For large groups (>256), fan-out on read: store once, each recipient reads their own cursor. WhatsApp uses fan-out on write for small groups for simplicity.' },
      { title: 'End-to-End Encryption', body: 'Each device generates a public/private key pair. Public keys are uploaded and stored on the server. When Alice sends a message, her client encrypts the message with Bob\'s public key. The server never has the decryption key. Signal Protocol provides forward secrecy — compromise of a key doesn\'t expose past messages.' },
    ],
    tradeOffs: [
      { approach: 'Fan-out on write vs read', pros: ['Write: Simple reads, fast for small groups', 'Read: Efficient for large groups (1 write per message)'], cons: ['Write: Expensive for large groups (256 writes)', 'Read: Need read index/cursor per user'] },
      { approach: 'WebSocket vs long polling', pros: ['WebSocket: Full-duplex, low latency, efficient', 'Long polling: Works everywhere, simpler'], cons: ['WebSocket: Needs sticky sessions, stateful servers', 'Long polling: Higher overhead, not truly real-time'] },
      { approach: 'Cassandra vs PostgreSQL for messages', pros: ['Cassandra: Linear write scaling, no single writer', 'PostgreSQL: Strong consistency, joins for inbox'], cons: ['Cassandra: Eventual consistency, no joins', 'PostgreSQL: Write bottleneck with single leader'] },
    ],
    k8sMapping: ['Connection Manager → StatefulSet (sticky sessions) + ClusterIP Service', 'Message Service → Deployment + HPA (CPU/memory)', 'Cassandra → StatefulSet (Cassandra Operator)', 'Redis → StatefulSet (Redis Cluster via Operator)', 'Media Service → Deployment + Object Storage (S3-compatible)', 'Kafka → StatefulSet (Strimzi Operator)'],
    keyTakeaways: ['Real-time systems need persistent connections (WebSocket) with regional distribution', 'Fan-out strategy depends on group size — hybrid approaches work best', 'End-to-end encryption is non-negotiable for consumer messaging', 'Presence and typing indicators require a heartbeat/publish-subscribe pattern'],
  },
  {
    id: 'uber-backend',
    title: 'Design Uber / Ride-Hailing',
    subtitle: 'Real-time matching, pricing, ETA, trip management at global scale',
    difficulty: 'expert',
    estimatedTime: '60 min',
    problem: 'Design the backend for a ride-hailing platform like Uber. Riders request rides; nearby drivers are matched. The system calculates ETAs, dynamic pricing (surge), and handles trip lifecycle. Must work globally with low latency for matching.',
    requirements: [
      'Match a rider with the nearest available driver in <1 second',
      'Support 10M+ active riders and 1M+ drivers globally',
      'Real-time location updates every 3 seconds from drivers',
      'Dynamic pricing based on supply/demand (surge zones)',
      'Trip lifecycle: request → match → pickup → ride → dropoff → payment',
      'Fault tolerant — matching must work during partial failures',
    ],
    architecture: {
      id: 'uber-backend',
      name: 'Uber-like Ride Hailing',
      blurb: 'Geospatial matching at scale. The core problem is finding nearest drivers in a radius efficiently using a quadtree or Geohash index.',
      tiers: [
        { label: 'Client', nodes: [{ label: 'Rider App', sub: 'Request ride · GPS', kind: 'external' }, { label: 'Driver App', sub: 'GPS pings · accept', kind: 'external' }] },
        { label: 'Edge', nodes: [{ label: 'API Gateway', sub: 'Auth · rate limit', kind: 'ingress' }] },
        { label: 'Core', nodes: [
          { label: 'Matching Service', sub: 'Geospatial index', kind: 'workload' },
          { label: 'Trip Service', sub: 'Lifecycle state machine', kind: 'workload' },
          { label: 'Pricing Service', sub: 'Surge · fare calc', kind: 'workload' },
          { label: 'ETA Service', sub: 'Route · traffic', kind: 'workload' },
        ] },
        { label: 'Data', nodes: [
          { label: 'Redis (Geo)', sub: 'Driver locations (GEO)', kind: 'data' },
          { label: 'PostgreSQL', sub: 'Trips · users · payments', kind: 'data' },
          { label: 'Kafka', sub: 'GPS event stream', kind: 'data' },
        ] },
      ],
    },
    deepDive: [
      { title: 'Geospatial Matching', body: 'Drivers send GPS coordinates every 3 seconds. Location data is stored in Redis using the GEO data structure (sorted set with geohash). When a rider requests a ride, the Matching Service queries Redis: GEORADIUS <key> <lat> <lon> <radius> to find nearby drivers. Results are ordered by distance. The rider is shown the top 3-5 drivers with ETAs. Redis GEO queries take <1ms for thousands of drivers.' },
      { title: 'Dynamic Pricing (Surge)', body: 'The Pricing Service divides cities into geohash zones. It monitors supply (available drivers) vs demand (ride requests) per zone in real-time via Kafka stream processing. When demand exceeds supply by a threshold, surge pricing activates (multiplier 1.2x-3x+). Surge pricing: (1) incentivizes more drivers to move into the zone, (2) reduces demand as some riders wait. Price decays as balance is restored.' },
      { title: 'Trip State Machine', body: 'A trip goes through states: REQUESTED → MATCHED → DRIVER_ARRIVING → PICKED_UP → IN_TRIP → COMPLETED. The Trip Service maintains this as a durable state machine in PostgreSQL. Each state transition emits events to Kafka. Downstream services react: payment on COMPLETED, receipt generation, driver payout calculation, rating prompts.' },
      { title: 'Fault Tolerance & Idempotency', body: 'Ride requests must be idempotent — if the rider presses "Request" twice, only one ride is created. Use a request_id (UUID) generated by the client as the idempotency key. If the Matching Service crashes mid-match, the request is retried after timeout. Drivers expire from the geospatial index if no heartbeat for 10 seconds.' },
    ],
    tradeOffs: [
      { approach: 'Redis GEO vs PostGIS', pros: ['Redis: <1ms queries, simple API', 'PostGIS: Persistent, complex spatial queries'], cons: ['Redis: Memory-bound, no persistence for old locations', 'PostGIS: Slower for real-time matching'] },
      { approach: 'Polling vs WebSocket for driver location', pros: ['WebSocket: Real-time, efficient', 'Polling: Simpler, stateless'], cons: ['WebSocket: Stateful servers, reconnection logic', 'Polling: 3s interval is wasteful if no drivers nearby'] },
      { approach: 'Monolith vs Microservices', pros: ['Microservices: Independent scaling of matching vs pricing', 'Clear team ownership'], cons: ['Microservices: Complex debugging, eventual consistency', 'Monolith: Simpler initially, but hard to scale team'] },
    ],
    k8sMapping: ['Matching Service → Deployment + HPA (latency-based) + ClusterIP', 'Trip Service → StatefulSet (state machine durability)', 'Pricing Service → Deployment + HPA (KEDA: Kafka consumer lag)', 'Redis → Redis Enterprise Operator (StatefulSet)', 'PostgreSQL → StatefulSet + PVC + read replicas', 'Kafka → Strimzi Operator (StatefulSet)'],
    keyTakeaways: ['Geospatial indexing is the core algorithmic challenge — Redis GEO is production-proven', 'State machines make complex workflows (trip lifecycle) tractable and auditable', 'Surge pricing is a control loop balancing supply and demand', 'Idempotency keys prevent duplicate charges in unreliable networks'],
  },
  {
    id: 'youtube',
    title: 'Design YouTube / Video Streaming',
    subtitle: 'Upload, transcode, store, and stream video at global scale',
    difficulty: 'expert',
    estimatedTime: '60 min',
    problem: 'Design a video streaming platform like YouTube. Users upload videos of any size/format. The system transcodes them into multiple resolutions, stores them durably, and serves them with low latency to a global audience. Handle millions of uploads and billions of views.',
    requirements: [
      'Support video uploads up to 10GB (4K, HDR)',
      'Transcode to multiple resolutions (144p, 360p, 720p, 1080p, 4K)',
      'Serve video with <200ms startup latency globally',
      'Handle 1B+ monthly active users, 500+ hours uploaded per minute',
      'Adaptive bitrate streaming (HLS/DASH) for varying network conditions',
      'Thumbnail generation and content moderation pipeline',
    ],
    architecture: {
      id: 'youtube',
      name: 'YouTube-like Video Platform',
      blurb: 'Massive-scale video pipeline: upload → transcode → store → serve with CDN edge caching. The transcoding step is the bottleneck.',
      tiers: [
        { label: 'Client', nodes: [{ label: 'Uploader', sub: 'Web/mobile upload', kind: 'external' }, { label: 'Viewer', sub: 'Streaming player', kind: 'external' }] },
        { label: 'Edge', nodes: [{ label: 'CDN', sub: 'Video segments cached', kind: 'ingress' }] },
        { label: 'Pipeline', nodes: [
          { label: 'Upload Service', sub: 'Chunked upload · resumable', kind: 'workload' },
          { label: 'Transcoder', sub: 'FFmpeg · GPU-accelerated', kind: 'workload' },
          { label: 'Thumbnail Gen', sub: 'Frame extraction', kind: 'workload' },
        ] },
        { label: 'Serve', nodes: [
          { label: 'Stream Service', sub: 'HLS/DASH manifest', kind: 'workload' },
          { label: 'Metadata API', sub: 'Title · views · likes', kind: 'workload' },
        ] },
        { label: 'Storage', nodes: [
          { label: 'Object Store', sub: 'Raw & transcoded videos', kind: 'data' },
          { label: 'MySQL', sub: 'Video metadata', kind: 'data' },
        ] },
      ],
    },
    deepDive: [
      { title: 'Upload Pipeline', body: 'Videos are uploaded in chunks (5MB each) via the Upload Service. Chunked uploads support resumability — if the connection drops, only the failed chunk is retried. After all chunks arrive, the Upload Service assembles the file and places it in the Raw Video bucket (S3/GCS). A message is published to the transcoding queue with the video ID.' },
      { title: 'Transcoding Strategy', body: 'The Transcoder workers pull from the queue and use FFmpeg with GPU acceleration (NVENC) to transcode into HLS segments. Each video is transcoded into 5 resolutions: 144p, 360p, 720p, 1080p, 4K. Output: a master manifest (.m3u8) pointing to resolution-specific playlists, each containing 10-second .ts segments. For a 10-min video at 5 resolutions: ~300 segments per resolution = 1500 files.' },
      { title: 'Streaming Delivery', body: 'The Stream Service generates HLS/DASH manifests dynamically. Video segments are served from the CDN edge cache. For cold content (first view in a region), segments are fetched from origin storage and cached at the edge. Hot content stays cached at the edge globally. Adaptive bitrate: the player starts with 360p, measures bandwidth, and upgrades to higher quality. ABR logic runs client-side.' },
      { title: 'Content Moderation Pipeline', body: 'Every uploaded video passes through an automated moderation pipeline: (1) Hash-based dedup against known copyrighted content (ContentID-like), (2) ML-based frame analysis for NSFW/violence detection, (3) Audio fingerprinting. Flagged content is queued for human review. The pipeline runs async and doesn\'t block the upload — flagged videos are served but marked for review.' },
    ],
    tradeOffs: [
      { approach: 'MP4 progressive downloads vs HLS/DASH', pros: ['HLS: Adaptive bitrate, segment caching, live support', 'MP4: Simpler, universal support'], cons: ['HLS: Requires manifest generation, more files', 'MP4: No adaptation, buffering on slow networks'] },
      { approach: 'CPU vs GPU transcoding', pros: ['GPU: ~10x faster per watt', 'Better for high-volume'], cons: ['CPU: More flexible codec support (AV1)', 'GPU: Higher upfront cost, vendor lock-in'] },
      { approach: 'Pre-transcode vs on-demand transcode', pros: ['Pre: Consistent quality, predictable load', 'On-demand: Save storage for rarely-watched videos'], cons: ['Pre: Store all resolutions even if never watched (most videos are never viewed)', 'On-demand: First viewer pays latency cost'] },
    ],
    k8sMapping: ['Upload Service → Deployment + HPA (CPU/memory) + ClusterIP', 'Transcoder → Deployment with GPU node pool (nodeSelector) + KEDA (queue depth)', 'Stream Service → Deployment + HPA + ClusterIP (behind CDN)', 'Metadata API → Deployment + read replicas (MySQL)', 'MySQL → StatefulSet + PVC (Vitess/MySQL Operator for sharding)', 'Thumbnail Gen → Job/CronJob per upload'],
    keyTakeaways: ['Video transcoding is the bottleneck — GPU acceleration and queue-based workers are essential', 'CDN is everything for streaming. Without it, origin servers would collapse under global traffic', 'Adaptive bitrate streaming is standard practice — always use HLS or DASH', 'Pre-transcoding vs on-demand is a storage-vs-latency trade-off; pre-transcode for guaranteed quality'],
  },
  {
    id: 'twitter-feed',
    title: 'Design Twitter / News Feed',
    subtitle: 'Scalable social feed — write-heavy with celebrity followers, live updates',
    difficulty: 'advanced',
    estimatedTime: '50 min',
    problem: 'Design the backend for a social media platform like Twitter. Users post tweets (280 chars). Followers see a chronological or algorithmic feed. Handle celebrity users with 100M+ followers. Tweets can include media. Real-time feed updates for active users.',
    requirements: [
      'Post tweets with text, images, and videos',
      'Show a feed of tweets from followed users (chronological + ranked)',
      'Handle users with 100M+ followers (Elon Musk, sports stars)',
      'Support likes, retweets, replies',
      'Real-time feed updates for active users',
      'Search tweets by content, hashtags, users',
    ],
    architecture: {
      id: 'twitter-feed',
      name: 'Twitter-like Social Feed',
      blurb: 'The classic fan-out problem: when a user with 100M followers tweets, how do you deliver it to everyone without melting the database?',
      tiers: [
        { label: 'Client', nodes: [{ label: 'Mobile/Web', sub: 'Tweet · scroll feed', kind: 'external' }] },
        { label: 'Edge', nodes: [{ label: 'API Gateway', sub: 'Auth · rate limit', kind: 'ingress' }] },
        { label: 'Write', nodes: [
          { label: 'Tweet Service', sub: 'Create tweets', kind: 'workload' },
          { label: 'Fan-out Service', sub: 'Distribute to followers', kind: 'workload' },
          { label: 'Media Service', sub: 'Upload images/video', kind: 'workload' },
        ] },
        { label: 'Read', nodes: [
          { label: 'Feed Service', sub: 'Merge & rank feed', kind: 'workload' },
          { label: 'Search Service', sub: 'Full-text search', kind: 'workload' },
        ] },
        { label: 'Data', nodes: [
          { label: 'Redis Cluster', sub: 'Pre-computed feeds', kind: 'data' },
          { label: 'Cassandra', sub: 'Tweets · timeline', kind: 'data' },
          { label: 'Elasticsearch', sub: 'Search index', kind: 'data' },
        ] },
      ],
    },
    deepDive: [
      { title: 'Fan-out Strategy', body: 'Hybrid approach: (1) Regular users (<10K followers): fan-out on write. The Tweet Service writes the tweet to each follower\'s feed in Redis (sorted set, score = timestamp). (2) Celebrity users (>10K followers): fan-out on read. The tweet is stored in the celebrity\'s timeline. Each follower\'s Feed Service merges their regular feed with the celebrity timeline on read. This prevents the "100M writes per tweet" problem.' },
      { title: 'Feed Generation', body: 'When a user opens the app, the Feed Service: (1) Fetches the pre-computed feed from Redis (sorted by timestamp), (2) For each celebrity the user follows, fetches recent tweets from Cassandra, (3) Merges and ranks by ML score (relevance, engagement prediction), (4) Paginates (20 tweets per page with cursor-based pagination). For celebrities, cache the Cassandra timeline query for 30 seconds.' },
      { title: 'Like/Retweet Counts', body: 'Like and retweet counts are critical for ranking. Use a separate counter service backed by Redis for real-time counts. Write to Redis synchronously (INCR), then async flush to Cassandra for durability. Lossy counts during failures are acceptable — Redis WAL or periodic snapshot provides recovery. Display counts are always read from Redis.' },
      { title: 'Search Indexing', body: 'Tweets are indexed into Elasticsearch via Kafka. The Tweet Service publishes a tweet_created event. A consumer indexes the tweet text, hashtags, mentions, and user. Search queries hit Elasticsearch directly. Use a separate write-optimized cluster for indexing and read replicas for query. For trending topics, a stream processing job computes top hashtags per time window.' },
    ],
    tradeOffs: [
      { approach: 'Fan-out on write vs read', pros: ['Write: O(1) read — feed is pre-computed', 'Read: O(1) write — no follower cost per tweet'], cons: ['Write: 100M writes for celebrity tweets (DDOS yourself)', 'Read: O(following) merge cost on every feed load'] },
      { approach: 'Redis vs Cassandra for feeds', pros: ['Redis: <1ms reads, sorted sets perfect for timeline', 'Cassandra: Durable, high write throughput'], cons: ['Redis: Memory-bound, not durable by default', 'Cassandra: Higher read latency (5-10ms)'] },
      { approach: 'Chronological vs Algorithmic feed', pros: ['Chrono: Simple, deterministic, predictable', 'Algo: Higher engagement, shows best content'], cons: ['Chrono: Misses important tweets from overnight', 'Algo: Filter bubble, complex to build right'] },
    ],
    k8sMapping: ['Tweet Service → Deployment + HPA (request rate) + ClusterIP', 'Fan-out Service → Deployment + KEDA (Kafka consumer lag)', 'Feed Service → Deployment + HPA (latency-based) + ClusterIP', 'Redis Cluster → Redis Operator (StatefulSet)', 'Cassandra → Cassandra Operator (StatefulSet)', 'Elasticsearch → Elasticsearch Operator (StatefulSet)', 'Search Service → Deployment + HPA (CPU)'],
    keyTakeaways: ['The fan-out problem is the defining architectural challenge of social platforms — hybrid approach is the answer', 'Pre-compute feeds for regular users; real-time merge for celebrities', 'Counters (likes/retweets) can be lossy in the short term — use Redis with async persistence', 'Search needs its own indexing pipeline — don\'t search the primary database'],
  },
];
