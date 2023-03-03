module.exports = ({env}) => ({
    email: {
      config: {
        provider: 'strapi-provider-email-sendinblue',
        providerOptions: {
          sendinblue_api_key: env('SIB_API_KEY', 'xkeysib-0987654321-abcdef'),
          sendinblue_default_replyto: env('SIB_DEFAULT_REPLY_TO', 'paras.bharde@shubhchintak.co'),
          sendinblue_default_from: env('SIB_DEFAULT_FROM', 'nparas.bharde@shubhchintak.co'),
          sendinblue_default_from_name: env('SIB_DEFAULT_FROM_NAME', 'Matrimony'),
        },
      },
    },
  });