// module.exports = ({env}) => ({
//     email: {
//       config: {
//         provider: 'strapi-provider-email-sendinblue',
//         providerOptions: {
//           sendinblue_api_key: env('SIB_API_KEY', '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'),
//           sendinblue_default_replyto: env('SIB_DEFAULT_REPLY_TO', 'paras.bharde@shubhchintak.co'),
//           sendinblue_default_from: env('SIB_DEFAULT_FROM', 'nparas.bharde@shubhchintak.co'),
//           sendinblue_default_from_name: env('SIB_DEFAULT_FROM_NAME', 'Matrimony'),
//         },
//       },
//     },
//   });


  module.exports = ({env}) => ({
    email: {
      config: {
        provider: 'strapi-provider-email-sendinblue',
        providerOptions: {
          sendinblue_api_key: env('SIB_API_KEY', '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'),
          sendinblue_default_replyto: env('SIB_DEFAULT_REPLY_TO', 'paras.bharde@shubhchintak.co'),
          sendinblue_default_from: env('SIB_DEFAULT_FROM', 'paras.bharde@shubhchintak.co'),
          sendinblue_default_from_name: env('SIB_DEFAULT_FROM_NAME', 'Matrimony'),
        },
       settings:{
    defaultFrom : 'paras.bharde@shubhchintak.co',
    defaultReplyTo : 'paras.bharde@shubhchintak.co'
  },
      },
    },
  });
  