---
authors: Nick Staggs (nick.c.staggs@gmail.com)
state: draft
---

# RFD 1 - Directory Browser

## UI

See main application page in [Wireframes](#wireframes), the login page will be a simple centered card with input fields for password and username as well as a submit button.

### Wireframes

![wire frame](image.png)

(ignore the dots above each of the icons)

### Reusable components

* TableRow
    * clickable name if directory
    * icon indicating type file or directory
        * Page indicates file
        * folder indicates directory
    * size in largest unit for that file 
        * rounded up to nearest tenth of unit unless its bytes which will be whole numbers only

* BreadCrumbs
    * each bread crumb clickable to navigate to that directory except current directory
    * / after each crumb
    * Possibly separate out into 2 components, BreadCrumb and BreadCrumbs
        * Probably use the breadcrumb component as clickable directory name in the table as well

* Search bar
    * Takes function to act on input into search bar
        * may want to include some kind of debouncing to make it less jerky

### Site url paths

* `https://<site-root>`
    * This will redirect to `/files` if the user is authenticated
* `https://<site-root>/files/<path>/<to>/<directory>?sort=<sort-field>&dir=<asc-or-desc>&filter=<filter-string>`
    * if sorting or filtering fields are malformed they will be ignored
        * this will mostly be the case for sort field if it is not one that is available or direction is not `asc` or `desc`
    * both fields will need to be encoded before being interpreted and used
* There will be no redirects when needing to reauthenticate, the login page will be shown and once the user authenticates successfully the page will load the directory information

### Error States
* 401
    * User will be shown the login page
    * URL will remain the same
* 400
    * Bad file path
    * URL will remain the same
    * User will be shown a page that details that the file path was improperly formed and a link to the home directory will be provided if they would like to navigate there
* 404
    * Directory does not exist
    * URL will remain the same
    * User will be shown a page that details that the file path doesn't exist and a link to the home directory will be provided if they would like to navigate there
* 500
    * Server error
    * If the frontend assets are still able to be served
        * URL will remain the same
        * User will be shown a page that details that there was an issue retrieving the information and to try again later

## API

* GET /api/files/\<path>/\<to>/\<directory>
    * Sorting and filtering query params will not be sent to the API
    * Responses
        * 200
            ```json
            {
                "name": "project",
                "type": "directory",
                "size": 0,
                "contents": [
                    {
                        "name": "main.go",
                        "type": "file",
                        "size": 4299
                    },
                    {
                        "name": "dev",
                        "type": "directory",
                        "size": 0
                    },
                    {
                        "name": "test",
                        "type": "directory",
                        "size": 0
                    }
                ]
            }
            ```
        * 404
        * 401

* POST /api/login
    * Payload
        ```json
        {
            "username": "<username>",
            "password": "<password>"
        }
        ```
    * Responses
        * 200 
        * 401

* POST /api/logout
    * Responses
        * 200


## Security

### Authentication

The main idea will be to create a session token after logging in and setting the expiration to 10 min into the future. On subsequent requests the expiration will be updated up to a maximum of 8 hours after the original login. The session token will be http only and secure so it will only be manipulated server side and only be transported over https. Samesite will be set to strict to restrict cookies being sent in requests not originating from the origin site. After a logout or max expiration the session token will be destroyed which will force the user to reauthenticate. 

#### Session Management

* Creation
    * On login user will input his credentials, a request will be made to the login endpoint which will hash the input password using `Argon2ID` and compare it to the existing hashed password for the username given. If the password hash matches create a session token. Create a cookie with the name `session` set to the session token value and add it to the response. Store the session token in a map, session token -> { userid, inactivityExpiration, maxExpiration }
        * Session token Generation
            * 128 bits
            * using go's [crypto/rand.text()](https://cs.opensource.google/go/go/+/go1.25.4:src/crypto/rand/text.go;l=14)
        * Possible Enhancements
            * could sign cookie
                * probably not needed due to the cookie only holding the session id so there really isn't anything to tamper with
                * this would make it so in the future if there were roles associated with the cookie it could be determined if the someone tried to escalate their privileges 

* Invalidation
    * On logout or after the session has expired either via the inactivityExpiration or maxExpiration the session will be deleted. For the non logout scenario the expiration and max age will be checked on each request which will dictate when the session is actually deleted.

### TLS

* Certificate
    * For dev this will just be a self signed cert using openssl
    * If this were to be deployed it would require a cert from a certificate authority how this is done is dependent on how it is deployed.

* Redirect
    * All requests made through http will be redirected via a 301 redirect to the requested page over https. Another option would be to disable listening to http requests on port 80 but this could lead to a poor user experience if a user were to use http. 

* HSTS header
    * All requests will get the HSTS header with max age set at 2 years so the browser will only access the site through https after the first request. If this site were to have subdomains it would be prudent to set include subdomains on the header but as that is not the case it will be omitted. Preload might also be worthwhile to set in a production environment.

* Version
    * minimum accepted will be 1.3
    * this might exclude some older clients from being able to use the site but will be a higher security posture

### Concerns

* Credential Stuffing/Brute forcing
    * This might be outside of the scope of this particular project 
    * Mitigations:
        * rate limiting based on IP for the login endpoint 
        * failed login counts

* Path Traversal
    * Mitigations:
        * input validation
            * whitelist well formed file paths
                * whitelist will likely be a regular expression that permits valid unix based file system directories
            * Resolve path and ensure that the first part of the file path matches the path of the directory that is being given access to
            * Example
                * the root directory for the directory that is being given access to is `/home/user/allowed-dir`
                * the url path is `../../../../../../etc/passwd` the resolved path would be `/etc/passwd` 
                * We would try to match the start of the resolved path to the directory being given access to and this would fail because `/etc/passwd` !== `/home/user/allowed-dir`
            
* Unix vs Windows file system issues
    * probably outside the scope of this exercise but worth calling out
    * The whitelist file path's would be different as unix is a lot more permissive when it comes to characters that can be a in a file or directory name
    * windows uses `\` as path separators unix uses `/`
    * I am going to assume unix based file systems for deployment

* XSS attack
    * This is largely mitigated by the design of this application in that there is no user input that will be saved and displayed back

* CSRF attack
    * This is also largely mitigated because there are no actions that can be performed to change internal state and even in a csrf login attack an attacker would be fooling a user to sign into the attacker's account but since there the access level is the same and there are no change state actions the only thing the attacker would be gaining is possibly a view into the victim's navigation on the site.
    * Mitigations:
        * require content type header to be set to json when validating the login request
            * must ensure the UI sets this header or else it will be rejected

## Testing

* Mainly unit tests
* nice to haves would be for some integration and a single e2e that logins in, navigates a little and logs out