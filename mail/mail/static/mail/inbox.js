document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox', false));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent', false));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive', false));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox',false);
});

function send_email(event) {
  // Modifies the default beheavor so it doesn't reload the page after submitting.
  event.preventDefault();

  // Get the required fields.
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;
  var message = document.querySelector('#message-view');
  message.style.display = 'block';
  message.style.width = 'fit-content';
  message.style.borderRadius = '4px';
  message.style.padding = '3px'

  if (recipients != ''){
    var recipients_list = recipients.split(', ');
    var valid = true;

    for (person in recipients_list){
      console.log(recipients_list[person]);

      if (!(validateEmail(recipients_list[person]))){
        console.log(validateEmail(recipients_list[person]));
        valid = false;
      }
      console.log (`valid is: ${valid}`);
    }
    
    if (valid){
      // Send the data to the server.
      fetch("/emails", {
        method: "POST",
        body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body,
        }),
      })
      // Take the return data and parse it in JSON format.
      .then((response) => response.json())
      .then((result) => {
      load_mailbox('sent', true, result);
      message.innerHTML = 'Sent!';
      message.style.border = '1px solid green';
      message.style.backgroundColor = 'lightgreen';
      message.style.color = 'green';
      })
      .catch((error) => console.log(error));
    }
    else{

      message.innerHTML = 'Invalid email entered';
      message.style.border = '1px solid red';
      message.style.backgroundColor = 'lightcoral';
      message.style.color = 'red';
    }
  }
  else{
    message.innerHTML = 'Email input required';
    message.style.border = '1px solid red';
    message.style.backgroundColor = 'lightcoral';
    message.style.color = 'red';
  }
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#message-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  //make editable
  document.querySelector('#compose-recipients').disabled = false;
  document.querySelector('#compose-subject').disabled = false;

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
 // Send email

}

function load_mailbox(mailbox, show_message) {

  if (show_message === false){
    document.querySelector('#message-view').style.display = 'none';
  }
  else {
    console.log ('here2')
    document.querySelector('#message-view').style.display = 'block';
  }

  var email_view = document.querySelector('#emails-view')
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox and hide other views
  email_view.style.display = 'block';

  // Show the mailbox name
  email_view.innerHTML = '';
  email_view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      if (emails.length == 0){
        email_view.innerHTML += 'No emails'
      }
      else {
        for (email in emails) {
          const mail = document.createElement ("div");
          var sender = document.createElement('span');
          var sub = document.createElement('span');
          var time = document.createElement('span');
          var id = document.createElement('p');

          //style code for each email
          mail.style.border = '1px solid black';

          if (mailbox === 'inbox'){

            if (emails[email]['read'] == true){
              mail.style.backgroundColor = 'white';
            }
            else{
              mail.style.backgroundColor = 'lightgray';
            }  
          }
          
          sender.innerHTML = emails[email]['sender'];
          sender.style.fontWeight = 'bold';

          id.innerHTML = emails[email]['id'];
          id.style.display = 'none';
          if (emails[email]['subject'] === ''){
            sub.innerHTML = 'No subject';
          }
          else{
            sub.innerHTML = emails[email]['subject'];
          }

          sub.style.position = 'absolute';
          sub.style.left = '350px'

          time.innerHTML = emails[email]['timestamp'];
          time.style.position = 'absolute';
          time.style.right = '100px';

          email_view.appendChild(mail);

          mail.appendChild(sender);
          mail.appendChild(sub);
          mail.appendChild(time);
          mail.appendChild(id);

          mail.addEventListener('click', event => {
            var element = event.target;
            //console.log (element.children);

            if (!(element.tagName == 'DIV')){
              element = element.parentElement;
            }
            var c = element.children;
            var new_id = c[3].innerHTML;

            load_email(new_id);
          });
        }
      }
  });
}

function load_email (id) {

  document.querySelector('#message-view').style.display = 'none';

  var email_view = document.querySelector('#emails-view')
  document.querySelector('#compose-view').style.display = 'none';

  email_view.style.display = 'block';
  email_view.innerHTML = '';

  fetch (`/emails/${id}`)
  .then (response => response.json())
  .then (email => {
      if (email.read === false){

        fetch (`/emails/${id}`,{
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        });
      }
      //mail div
      const mail = document.createElement("div");

      var sender = document.createElement("span");
      var sub = document.createElement("h5");
      var time = document.createElement("span");
      var new_id = document.createElement("p");
      var body = document.createElement("p");
      var archive_button = document.createElement("button");
      var buttons = document.createElement("span");
      var reply_button = document.createElement("button");
      var reply_all = document.createElement("button");
      var name = document.createElement("span");
      var recipients = document.createElement("span");

      buttons.appendChild(archive_button);
      buttons.appendChild(reply_button);
      buttons.appendChild(reply_all);
      buttons.style.position = 'relative';
      buttons.style.float = 'right';
      reply_button.style.marginLeft = '5px';
      reply_all.style.marginLeft = '5px'

      name.innerHTML = email['name'];
      name.style.fontWeight = 'bold';
      name.style.paddingRight = '15px';

      sender.innerHTML = email['sender'];
      sender.style.position = 'absolute';

      recipients.innerHTML = `To: ${email['recipients'][0]}`;
      for (let i = 1; i < email['recipients'].length; i++){
        recipients.innerHTML += `, ${email['recipients'][i]}`;
      }
      recipients.style.color = 'gray';

      new_id.innerHTML = email['id'];
      new_id.style.display = 'none';
      if (email['subject'] === ''){
        sub.innerHTML = 'No subject';
      }
      else{
        sub.innerHTML = email['subject'];
      }
      time.innerHTML = email['timestamp'];
      time.style.float = 'right';

      body.innerHTML = email['body'].replaceAll('\n','<br>');

      if (email.archived === false){
        archive_button.innerHTML = 'Archive';
      }
      else {
        archive_button.innerHTML = 'Unarchive';
      }

      archive_button.className = "btn btn-sm btn-outline-primary";
      archive_button.id = "archive_button";
      reply_button.innerHTML = 'Reply'; 
      reply_button.className = "btn btn-sm btn-outline-primary";
      reply_button.id = "reply_button"
      reply_all.innerHTML = 'Reply All';
      reply_all.className = "btn btn-sm btn-outline-primary";
      reply_all.id = 'reply_all';

      email_view.appendChild(mail);
      mail.appendChild(sub);
      mail.appendChild(name);
      mail.appendChild(sender);
      mail.appendChild(time);
      mail.appendChild(document.createElement("br"));
      mail.appendChild(recipients);
      mail.appendChild(buttons);
      mail.appendChild(document.createElement("br"));
      mail.appendChild(document.createElement("br"));
      //mail.appendChild(br);
      //mail.appendChild(id);
      mail.appendChild(body);

      mail.addEventListener('click', event => {
        var element = event.target;

        if (element.id === 'archive_button'){
          archive_email(id, email.archived);
        }
        else if (element.id === 'reply_button'){
          reply_email(email, false);
        }
        else if (element.id === 'reply_all'){
          reply_email(email, true);
        }
      });
    });
  }

function archive_email(id, is_archived){

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !(is_archived),
    })
  });
  load_mailbox('inbox', false);
}

function reply_email(mail, reply_all){

  var message = document.querySelector('#message-view')
  message.style.display = 'none';

  const subject = document.querySelector('#compose-subject');
  const recipients = document.querySelector('#compose-recipients');
  recipients.value = '';
  const mail_from = document.querySelector('#compose-sender');

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  if (reply_all === false){
    recipients.value = mail['sender'];
    console.log("1");
  }
  else {
    console.log("2");
    if (mail['sender'] != mail_from.value){
      recipients.value += mail['sender'];
      recipients.value += ', ';
    }

    var recipients_length = mail['recipients'].length-1;

    if (mail['recipients'].includes(mail_from.value)){
      recipients_length -= 1;
    }
    if (mail['recipients'].includes(mail['sender'])){
      recipients_length -= 1;
    }

    for (person in mail['recipients']){

      if (mail['recipients'][person] != mail_from.value && mail['recipients'][person] != mail['sender']){
        recipients.value += mail['recipients'][person];

        if (mail['recipients'][person] != mail['recipients'][recipients_length]){
          recipients.value += ', ';
        }
      }

    }
  }

  recipients.setAttribute ('disabled',true);
  var string1 = mail['subject'].substr(0,3);
  var string2 = "Re:"

  if (string1 === string2){
    subject.value = mail['subject'];
  }
  else{
    subject.value = (`Re: ${mail['subject']}`);
  }

  subject.setAttribute('disabled',true);

  const body = document.querySelector('#compose-body');
  body.value = '';

  document.querySelector('#compose-body').value = `\n\nOn ${mail['timestamp']}, ${mail['sender']} wrote:\n${mail['body']}`;

  message.innerHTML = "Sent!";
}

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
