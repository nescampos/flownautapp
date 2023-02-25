const api = "c4fa5234-0022-48d8-bc66-40d31150f912";

// override some of the default configuration options
// see the docs for a full list of configuration options


function saveAddressInStorage(address, secret) {
  var addresses = JSON.parse(localStorage.getItem("addresses"));
  if(addresses != null) {
    addresses.push({address:address, key: secret});
    
  }
  else {
    addresses = []
    addresses.push({address:address, key: secret});
  }
  localStorage.setItem("addresses", JSON.stringify(addresses));
}



function getFirstAddress() {
  var addresses = JSON.parse(localStorage.getItem("addresses"));
  return addresses[0];
}

function sendTransaction() {
  var address = getFirstAddress();
  var recipient = $('#trx_address').val();
  if(recipient == '') {
    $('#errorTrx').css("display","block");
    $('#errorTrx').text("Recipient is invalid");
    return;
  }
  var amount = $('#trx_amount').val();
  if(amount == '') {
    $('#errorTrx').css("display","block");
    $('#errorTrx').text("Amount is invalid");
    return;
  }
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://api-us-west1.tatum.io/v3/flow/transaction",
    "method": "POST",
    "headers": {
      "content-type": "application/json",
      "x-api-key": api
    },
    "processData": false,
    "data": "{\"account\":\""+address.address+"\",\"to\":\""+recipient+"\",\"currency\":\"FLOW\",\"amount\":\""+amount+"\",\"privateKey\":\""+address.key+"\"}"
  };
  
  $.ajax(settings).done(function (response) {
    $('#errorTrx').css("display","none");
    $('#errorTrx2').css("display","block");
    $('#errorTrx2').text('The transaction is valid and successfully execute with id '+response.txId);
    checkBalance();
    console.log(response);
  }).fail(function (response) {
    $('#errorTrx').css("display","block");
    $('#errorTrx2').css("display","none");
    console.log(response);
    if(response.responseJSON.data != null) {
      $('#errorTrx').text('There was an error with your transaction. Check the form. '+response.responseJSON.data[0]);
    }
    else {
      $('#errorTrx').text('There was an error with your transaction. '+response.responseJSON.cause);
    }
    
    
  });
}


function generateWallet()
{
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api-us-west1.tatum.io/v3/flow/wallet",
        "method": "GET",
        "headers": {
          "x-api-key": api
        }
      };


      
      $.ajax(settings).done(function (response) {
        console.log(response);
        $('#Mnemonic_new').text(response.mnemonic);
        $('#xpub_new').text(response.xpub);

        const settingsAddress = {
          "async": true,
          "crossDomain": true,
          "url": 'https://api.tatum.io/v3/flow/address/'+response.xpub+'/0',
          "method": "GET",
          "headers": {
            "x-api-key": api
          }
        };

        $.ajax(settingsAddress).done(function (response2) {
            console.log(response2);
            $('#new_address_generated').show();
            $('#address').text(response2.address);
    
            const settingsPriv = {
              "async": true,
              "crossDomain": true,
              "url": 'https://api.tatum.io/v3/flow/wallet/priv',
              "method": "POST",
              "headers": {
                "content-type": "application/json",
                "x-api-key": api
              },
              "processData": false,
              "data": "{\"index\":0,\"mnemonic\":\""+response.mnemonic+"\"}"
            };

            $.ajax(settingsPriv).fail(function(error)
            {
              console.log(error);
            }).done(function (response3) {
              console.log(response3);
              $('#new_address_generated').show();
              $('#privateKey').text(response3.key);
    
              saveAddressInStorage(response2.address, response3.key);

              $('#generateWalletButton').css('display','none');
              
              $('#loginButton').css('display','block');
          });
        });
      });
}

// do something when registration is successful
$(document).on("webauthn-register-success", () => {
  location.href = 'index.html';
});

function confirmKeySaved() {
  localStorage.authenticated = "true";
  location.href = 'index.html';
}

function generateWalletFromPrivateKey()
{
    const privateKey = $('#pvKeyValue').val();
    const addressValue = $('#addressValue').val();
    if(privateKey != '' && addressValue != '') {
        saveAddressInStorage(addressValue, privateKey);
        confirmKeySaved();
    }
    else {
      $('#errorLogin').css("display","block");
        $('#errorLogin').text('The private key and address are not valid.');
        
    }
}

function checkBalance()
{
    const publicAddress = getFirstAddress().address;
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api-us-west1.tatum.io/v3/flow/account/"+publicAddress,
        "method": "GET",
        "headers": {
          "x-api-key": api
        }
      };
      
      $.ajax(settings).done(function (response) {
        $('.view_balance_address').text(response.balance/100000000);
      });
}

function checkCurrentBlock() {
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api-us-west1.tatum.io/v3/flow/block/current",
        "method": "GET",
        "headers": {
          "x-api-key": api
        }
      };
      
      $.ajax(settings).done(function (response) {
        $('.view_block_number').text(response);
        console.log(response);
      });
}

function getBlockData(blockNumber)
{
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api-us-west1.tatum.io/v3/flow/block/"+blockNumber,
        "method": "GET",
        "headers": {
          "x-api-key": api
        }
      };
      
      $.ajax(settings).done(function (response) {
        console.log(response);
      });
}

function checkAddress()
{
  const address = $('#verify_address').val();
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api-us-west1.tatum.io/v3/security/address/"+address,
        "method": "GET",
        "headers": {
          "x-api-key": api
        }
      };
      
      $('#is_valid_address').css('display',"block");
      $.ajax(settings).done(function (response) {
        if(response.status == 'valid') {
          $('#is_valid_address').text('The address '+address+" is valid");
        }
        else {
          $('#is_valid_address').text('The address '+address+" is not valid");
        }
        console.log(response);
      }).fail(function (response) {
          $('#is_valid_address').text('The address '+address+" is not valid");
        console.log(response);
      });
}

function logout() {
  localStorage.clear();
  location.href = 'login.html';
}
    

setInterval(
    checkCurrentBlock(),30000
);

$(function()
{
  if(localStorage.authenticated != null) {
    checkBalance();
    var address = getFirstAddress().address;
    $('.current_account').qrcode(address);
    $('.current_account_text').text(address);

  }

  $('#reviewScan').click(function() {
    window.open('https://testnet.flowscan.org/account/'+getFirstAddress().address)
  })
  
    $('#generateWalletButton').click(
        function() {
        generateWallet()});

    $('#generateWalletPrivKeyButton').click(
        function() {
            generateWalletFromPrivateKey()});

    $('#confirmKeySavedButton').click(
      function() {
        confirmKeySaved()});

        $('#loginButton').click(
          function() {
            confirmKeySaved()});

    $('#verifyAddressButton').click(
      function() {
        checkAddress()});
    $('#btnLogout').click(
      function() {
        logout()});

    $('#sendTrxButton').click(
      function() {
        sendTransaction()});
    
}
    
);
