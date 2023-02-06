import { NETWORK } from '../../../models/networkConfiguration';
import { getIdentityAuthenticityAndApproval } from './identity';

/**
 * These are integration tests, they call the blockchain and are subject to break if the blockchain is updated.
 * Before running the tests, make sure that the identityData is up to date or the tests will fail.
 *
 * The tests are skipped by default (due to the reason mentionned above), remove `.skip` to run them.
 */

const TEST_CASES: {
  caseName: string;
  network: NETWORK;
  identityAddress: string;
  identityData: any;
  expectedIsApproved: boolean;
  expectedIsAuthentic: boolean;
}[] = [
  {
    caseName: 'Stade Toulousain identity',
    network: NETWORK.stadetoulousain,
    expectedIsApproved: true,
    expectedIsAuthentic: true,
    identityAddress: '0x3c9d7ccf2501857051b747f3A42c54588e7F3835',
    identityData: {
      $schema: 'https://cert.arianee.org/version2/ArianeeBrandIdentity-i18n.json',
      name: 'Stade Toulousain',
      description:
        'Le Stade Toulousain évolue en Top 14 et en Coupe d’Europe. <br/> <br/>Depuis sa création, le Stade Toulousain a remporté 21 fois le Championnat de France de rugby à XV et est quintuple Champion d’Europe, ce qui en fait à ce jour le club français et européen le plus titré. <br/> <br/> En 2019, le Stade Toulousain a été reconnu comme le club de rugby français possédant la plus grosse notoriété, et le quatrième club français, tous sports confondus. La même année, le club a été classé 1er Centre de Formation par la Ligue Nationale de Rugby comme le plus performant du Top 14. <br/> <br/> Au-delà du cadre purement sportif, le Stade Toulousain, dans le cadre de sa démarche RSE, s’engage pleinement dans la vie économique et sociale de sa ville et de sa région.',
      externalContents: [
        {
          type: 'website',
          title: 'Découvrir la collection de NFT Stade Toulousain',
          url: 'https://nft.stadetoulousain.fr/',
          order: 1
        }
      ],
      pictures: [
        {
          type: 'brandLogoHeader',
          url:
            'https://cdn-prod-1.arianee.com/stadetoulousain/BDH/Copie%20de%20Logo%20ST%20_horizontal_2000x700.png'
        },
        {
          type: 'brandLogoSquare',
          url:
            'https://cdn-prod-1.arianee.com/stadetoulousain/BDH/Copie%20de%20Logo%20ST_square_500x500.png'
        },
        {
          type: 'brandHomePicture',
          url:
            'https://cdn-prod-1.arianee.com/stadetoulousain/BDH/Copie%20de%20Brand%20collection%20Picture_3200x1900-min.jpg'
        },
        {
          type: 'brandItemBackgroundPicture',
          url:
            'https://cdn-prod-1.arianee.com/stadetoulousain/BDH/Copie%20de%20Brand%20item%20background_free_3200x1900-min%20-%20V2.jpg'
        },
        {
          type: 'brandBackgroundPicture',
          url:
            'https://cdn-prod-1.arianee.com/stadetoulousain/BDH/Copie%20de%20Brand%20description%20background_1900x3200.jpg'
        },
        {
          type: 'brandLogoHeaderReversed',
          url:
            'https://cdn-prod-1.arianee.com/stadetoulousain/BDH/Copie%20de%20Logo%20ST%20_horizontal_2000x700.png'
        }
      ],
      socialmedia: [
        { type: 'facebook', value: 'StadeToulousainOfficiel' },
        { type: 'instagram', value: 'stadetoulousainrugby' },
        { type: 'twitter', value: 'StadeToulousain' },
        { type: 'youtube', value: 'stadetoulousain' }
      ],
      rpcEndpoint: 'https://api.bdh-stadetoulousain.arianee.com/rpc'
    }
  },
  {
    caseName: 'Unapproved & unauthentic identity',
    network: NETWORK.mainnet,
    expectedIsApproved: false,
    expectedIsAuthentic: false,
    identityAddress: '0x30b23ecde416304003942A28510913CA7B252e32',
    identityData: {
      $schema: 'https://cert.arianee.org/version2/ArianeeBrandIdentity-i18n.json',
      mock: []
    }
  },
  {
    caseName: 'Identity with invalid identity data (no schema)',
    network: NETWORK.mainnet,
    expectedIsApproved: false,
    expectedIsAuthentic: false,
    identityAddress: '0x30b23ecde416304003942A28510913CA7B252e32',
    identityData: {
      mock: []
    }
  },
  {
    caseName: "Maxime's BDH identity",
    network: NETWORK.testnet,
    expectedIsApproved: true,
    expectedIsAuthentic: true,
    identityAddress: '0x305051e9a023fe881EE21cA43fd90c460B427Caa',
    identityData: {
      $schema: 'https://cert.arianee.org/version2/ArianeeBrandIdentity-i18n.json',
      name: 'BDh maxime',
      description: 'test',
      pictures: [
        {
          type: 'brandLogoSquare',
          url: 'https://bdh-maxime.api.staging.arianee.com/pub/1673276288690-logo-square.png'
        }
      ],
      rpcEndpoint: 'https://bdh-maxime.api.staging.arianee.com/rpc'
    }
  },
  {
    caseName: 'BDH TECHTEAM POA identity',
    network: NETWORK.mainnet,
    expectedIsApproved: true,
    expectedIsAuthentic: true,
    identityAddress: '0x91c1959F96693fC98bF8fE2F6171CCA4d543BdCa',
    identityData: {
      $schema: 'https://cert.arianee.org/version2/ArianeeBrandIdentity-i18n.json',
      name: 'BDH Techteam POA',
      pictures: [
        {
          type: 'brandLogoHeader',
          url: 'https://bdh-techteam-poa.api.arianee.com/pub/1673278152066-logo-black.png'
        },
        {
          type: 'brandLogoHeaderReversed',
          url: 'https://bdh-techteam-poa.api.arianee.com/pub/1673278167514-logo-white.png'
        },
        {
          type: 'brandLogoSquare',
          url: 'https://bdh-techteam-poa.api.arianee.com/pub/1673278179127-logo-square.png'
        },
        {
          type: 'brandHomePicture',
          url: 'https://bdh-techteam-poa.api.arianee.com/pub/1673278636526-brand-collection.png'
        }
      ],
      rpcEndpoint: 'https://bdh-techteam-poa.api.arianee.com/rpc'
    }
  },
  {
    caseName: 'POAP identity',
    network: NETWORK.polygon,
    expectedIsApproved: true,
    expectedIsAuthentic: true,
    identityAddress: '0x773211AaCfde8782Ba241fddb471925B4A41d209',
    identityData: {
      $schema: 'https://cert.arianee.org/version2/ArianeeBrandIdentity-i18n.json',
      name: 'POAP',
      description:
        'Launched in 2018 and incorporated in 2021, POAP Inc. raised a $10 million Seed round led by Archetype and Sapphire Sport in January 2022.<br>\nTo date, over 4.5M POAPs have been issued to over half a million collectors, with the company partnering with the likes of adidas, Budweiser, Coach, TIME Magazine, Lollapalooza, FOX, the US Open, and more on one-time drops.',
      externalContents: [
        {
          type: 'website',
          title: 'poap.xyz',
          url: 'https://poap.xyz/'
        }
      ],
      pictures: [
        {
          type: 'brandLogoHeader',
          url: 'https://api.bdh-poap-polygon.arianee.com/pub/1657546562935-BrandLogoHeader.png'
        },
        {
          type: 'brandLogoHeaderReversed',
          url: 'https://api.bdh-poap-polygon.arianee.com/pub/1657546562935-BrandLogoHeader.png'
        },
        {
          type: 'brandLogoSquare',
          url: 'https://api.bdh-poap-polygon.arianee.com/pub/1657546662865-BrandLogoSquare.png'
        },
        {
          type: 'brandHomePicture',
          url:
            'https://api.bdh-poap-polygon.arianee.com/pub/1657546854255-Brand-Collection-Picture.jpeg'
        },
        {
          type: 'brandItemBackgroundPicture',
          url:
            'https://api.bdh-poap-polygon.arianee.com/pub/1657547009725-Brand-Item-Background-Picture.jpeg'
        },
        {
          type: 'brandBackgroundPicture',
          url:
            'https://api.bdh-poap-polygon.arianee.com/pub/1657547804783-BrandBackgroundPicture2.png'
        },
        {
          type: 'certificateBackgroundPicture',
          url:
            'https://api.bdh-poap-polygon.arianee.com/pub/1657547804783-BrandBackgroundPicture2.png'
        },
        {
          type: 'itemBackgroundPicture',
          url:
            'https://api.bdh-poap-polygon.arianee.com/pub/1657547964903-Item-Background-Picture-2.jpeg'
        }
      ],
      socialmedia: [
        {
          type: 'twitter',
          value: 'https://twitter.com/poapxyz/'
        }
      ],
      rpcEndpoint: 'https://api.bdh-poap-polygon.arianee.com/rpc',
      mock: []
    }
  }
];

describe('identity', () => {
  describe('getIdentityAuthenticityAndApproval', () => {
    it.skip.each(TEST_CASES)(
      'case %#',
      async ({
        caseName,
        network,
        identityAddress,
        identityData,
        expectedIsApproved,
        expectedIsAuthentic
      }) => {
        const { isApproved, isAuthentic } = await getIdentityAuthenticityAndApproval({
          network,
          identityAddress,
          identityData
        });

        // eslint-disable-next-line no-console
        console.info(caseName, { isApproved, isAuthentic });

        expect(isApproved).toBe(expectedIsApproved);
        expect(isAuthentic).toBe(expectedIsAuthentic);
      }
    );
  });
});
