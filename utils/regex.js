module.exports = {
    username: /^[a-zA-Z0-9\-_]{4,20}$/,
    string: /^$|^[a-zA-Z0-9\-_]{1,40}$/,
    email: /^[a-zA-Z0-9\._\-]{1,50}@[a-zA-Z0-9_\-]{1,50}(.[a-zA-Z0-9_\-])?.(ca|com|org|net|info|us|cn|co.uk|se)$/,
    password: /^[^ \s]{4,15}$/,
    number: /^$|^[0-9]{1,2}$|100/,
    phone: /^$|^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/
}