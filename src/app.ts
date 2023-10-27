import axios from 'axios';
import { ENV } from './utils/config';
// import { sendTelegramMessage } from './utils';

interface MinLiquidity {
  minLiquidity: number;
}

interface Token {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  num_market_pairs: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  infinite_supply: boolean;
  last_updated: string;
  date_added: string;
  tags: string[];
  platform: {};
  self_reported_circulating_supply: number;
  self_reported_market_cap: number;
  quote: Record<string, { [index: string]: any }>;
}

/**
 *
 * @param minLiquidity {number} minimum amount of liquidity
 */
export async function processNewListings({ minLiquidity }: MinLiquidity) {
  let msg = '';

  try {
    const latestListings = await axios.get(
      ENV.COINMARKETCAP_LASTEST_LISTINGS_URL,
      {
        headers: {
          'X-CMC_PRO_API_KEY': ENV.COINMARKETCAP_API_KEY,
          Accept: 'application/json',
          'Accept-Encoding': 'deflate, gzip',
        },
      }
    );

    // Filter tokens with pools in specified dex platforms and liquidity greater than minLiquidity
    let filteredTokens = latestListings?.data?.data.filter((token: Token) => {
      if (
        token.platform &&
        token.platform['name'].toLowerCase() == 'ethereum' &&
        token.quote.USD.volume_24h > minLiquidity
      ) {
        return token;
      }
    });

    const tokenIdArr = [];
    const tokenInfoRequest = filteredTokens.slice(0, 5).map(async (token) => {
      tokenIdArr.push(token.id);

      return await axios.get(
        `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${token.id}`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': ENV.COINMARKETCAP_API_KEY,
            Accept: 'application/json',
            'Accept-Encoding': 'deflate, gzip',
          },
        }
      );
    });

    const tokenInfoResponse = await axios.all(tokenInfoRequest);
    const result = tokenInfoResponse.map((resp: any, i) => {
      if (resp.data.status.error_code === 0) {
        const {
          name,
          symbol,
          urls,
          contract_address,
          infinite_supply,
          platform,
        } = resp.data.data[tokenIdArr[i]];

        return {
          name,
          symbol,
          contract_address,
          infinite_supply,
          platform,
          urls,
        };
      }
    });

    result.forEach((token: any) => {
      msg += `
      Token Name: ${token.name}
      website: ${token.urls?.website?.[0]}
      twitter: ${token.urls?.twitter?.[0]}
      telegram: ${token.urls?.chat?.[0]}
      facebook: ${token.urls?.facebook?.[0]}
      reddit: ${token.urls?.reddit?.[0]}
      `;
    });

    return msg;
  } catch (err) {
    throw Error(err);
  }
}
