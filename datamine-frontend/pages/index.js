// pages/index.js
import React from 'react';
import Link from 'next/link';

const Home = () => {
  return (
    <div>
      <header>
        <h1>Data Brokerage Marketplace</h1>
        <button>Sign In</button>
      </header>

      <section>
        <h2>Data Marketplace Options</h2>
        <div className="marketplace-options">
          <Link href="/data/list">
            <div className="marketplace-option">
              <h3>Data Listing 1</h3>
              {/* Add relevant information about the data listing */}
            </div>
          </Link>

          <Link href="/data/list">
            <div className="marketplace-option">
              <h3>Data Listing 2</h3>
              {/* Add relevant information about the data listing */}
            </div>
          </Link>

          {/* Add more data marketplace options as needed */}
        </div>
      </section>

      <section>
        <h2>Recent Activity Feed</h2>
        <div className="recent-activity">
          {/* Display recent user activities, such as data purchases, listings, etc. */}
          <p>User XYZ purchased Data Listing 1</p>
          <p>User ABC listed new data for sale</p>
          {/* Add more recent activities as needed */}
        </div>
      </section>

      <section>
        <h2>Sign Up</h2>
        <button>Sign Up</button>
      </section>
    </div>
  );
};

export default Home;