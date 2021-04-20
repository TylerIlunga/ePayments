/**
 * Module for the email(s) generated for notifying businesses on the status of the auto-conversion process.
 * @module src/email/templates/TokenConversionStatus/index.js
 */
module.exports = (emailMetaData) => {
  if (emailMetaData.status === 'failure') {
    return `
    Token Conversion Status: <strong>Failed</strong>
    <br/><br/>
    We can see the failures and are working on a solution for them as you read this message. 
    <br/><br/>
    For now, you can <a href='https://www.coinbase.com'>log in to your Coinbase account</a> in order to convert your tokens into your desired fiat currency if need be.
    <br/><br/>
    Please contact support@mizudev.com if you require additional information regarding the conversion failures.
    <br/><br/>
    <b>Mizu Team</b>
  `;
  }
  return `
    Token Conversion Status: <strong>Success</strong>
    <br/><br/>
    Below is conversion information provided by Coinbase:
    <br/><br/>
    <strong>Initiated:</strong> ${emailMetaData.conversionData.created_at}
    <br/><br/>
    <strong>From:</strong> ${emailMetaData.conversionData.amount.amount} ${emailMetaData.conversionData.amount.currency}
    <br/><br/>
    <strong>To:</strong> ${emailMetaData.conversionData.total.amount} ${emailMetaData.conversionData.total.currency} (Total) | ${emailMetaData.conversionData.subtotal.amount} ${emailMetaData.conversionData.subtotal.currency} (SubTotal)
    <br/><br/>
    Please contact support@mizudev.com if you require additional information regarding the conversion process.
    <br/><br/>
    <b>Mizu Team</b>
  `;
};
