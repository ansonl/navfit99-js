# NAVFITOnline-js

##### View and Edit US Navy NAVFIT files without NAVFIT98A.

![NAVFIT hi res](https://github.com/navfit99/navfit99.github.io/blob/master/assets/img/navfit99-256.png?raw=true)

### Use NAVFITOnline at **[https://navfit99.github.io](https://navfit99.github.io)**. 

#### Master repository for issues and pull requests located at [ansonl/navfit99-js](https://github.com/ansonl/navfit99-js).  ***[navfit99/navfit99.github.io](https://navfit99.github.io)* is the public gh-pages release of *ansonl/navfit99-js* for URL path reasons. ** 

##### Part of NAVFITOnline project: [client-cert-auth](https://github.com/ansonl/client-cert-auth), [navfit99-js](https://github.com/ansonl/navfit99-js), and [navfit99-server](https://github.com/ansonl/navfit99-server)

#### The CAC login demo server is hosted on a personal VM and likely be down due to restarts, etc ~~bears~~. *Recommend you run [client-cert-auth](https://github.com/ansonl/client-cert-auth) on your own machine and change `authBaseURL` (explained in Step #3 in instructions below) to run your own CAC login server.*

![NAVFIT online demo clip](https://github.com/ansonl/navfit99-js/raw/master/assets/img/navfit99capture.gif)

### What is NAVFITOnline?
NAVFITOnline is an open source project that allows you to view and edit NAVFIT98A database (.accdb) files. The provided [GitHub pages version of the webapp](https://navfit99.github.io) uses a publicly accessible server on the internet for functionality. This server is intended for demo purposes only. 

Users that may find this helpful include:
- Apple Mac OSX users
- Linux users
- Windows users unable to install MSAccess drivers or NAVFIT98A
- Users who want to view older electronic evaluations when NAVFIT98A is no longer available. 

NAVFITOnline's development name in parts of the codebase is NAVFIT99.

### Features of NAVFITOnline
- Import NAVFIT database *accdb* files used by NAVFIT98A. 
- Create new NAVFIT database files.
- **View Folders' Reports** in NAVFIT database.
- **View and Edit Reports** in NAVFIT database.
  - **Move Reports** to different Folders (not available in NAVFIT98A)
- **View and Edit entire NAVFIT database** in [JSON](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON) (not available in NAVFIT98A).
- **CAC enabled login** through web browser to keep track of user NAVFITs. 
  - Public [https://navfit99.github.io](https://navfit99.github.io) site currently set to accept DoD CAC only. 

#### Future to-dos for NAVFITOnline (aka: Not features of NAVFITOnline)
- View Folders [template] content data. (Implemented on server side already.)
- Move Folders to different Folders. 
- Update Member Trait Group Average and Summary Group Average. 
 
### This seems like a limited solution. Why don't you make a \[cloud/centralized/reorganized/insert word here\] evaluation system?

NAVFITOnline is meant to be a "drop-in" "shim" solution for working with the current NAVFIT98A program and format. Making a new CMS system for Navy evaluations is a different project. The goal of NAVFITOnline is to retain compatibility with the NAVFIT98A program *(ex: make changes in NAVFITOnline -> open in NAVFIT98A)*.  To allow users a different way to view and edit evaluations if NAVFIT98A is unavailable for some reason. 

The main feature of NAVFITOnline is the ability to read and write the NAVFIT98A database files on a non-windows environment. Using this feature, we can manipulate the raw data of any evaluation so pretty much any feature is possible while maintaining compatibility with the current NAVFIT98A.

### Why have you not implemented X feature, yet? 

NAVFITOnline is currently a side project that I work on in my free time. If you would like to contribute or suggest features, please create an issue or pull request. 

#### Security of NAVFITOnline public demo site [https://navfit99.github.io](https://navfit99.github.io)
- NAVFIT data is encrypted using [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) and a 128 bit secret key kept on the server as an environment variable. 
- **Encrypted NAVFIT data are stored on a publicly accessible Redis database.**
- User authentication tokens are stored as [SHA256](https://csrc.nist.gov/csrc/media/publications/fips/180/4/final/documents/fips180-4-draft-aug2014.pdf) hashes.
-  **Hashed user authentication tokens are stored on a publicly accessible Redis database.**
- User authentication tokens are passed back to the browser as GET parameters. 
- Certificate revovation checking is turned off. 
-  **The decision to use a publicly accessible database for storage was made to balance the cost of running the public demo server backend (navfit99-server) on Heroku.** As with all protected data, there is always the possibility of an exploit or brute force attack to decrypt data. 
- Demo NAVFIT-server has a 1 week expiration for saved NAVFITs. Editing a NAVFIT will reset the expiration to be 1 week from the time of latest edit. 

### Can I run NAVFITOnline on my own computer?
Yes, please see each project portions' READMEs' *Setup* section.

### What is NAVFIT98A?
NAVFIT98A is a Windows program created by SPAWAR that allows people to organize and edit U.S. Navy Evaluations and Fitness Reports. NAVFIT98A is available for Windows. See [here](http://www.public.navy.mil/bupers-npc/career/performanceevaluation/Pages/default.aspx) for more information.

If you are looking for the Microsoft Access Database Engine 2007 Driver and it is unavailable on Microsoft, you may use the backup [here](https://github.com/navfit99/backup) at your own risk. 

### Is NAVFITOnline associated with the U.S. Government?
NO.

### What is your relation to the U.S. Government?
I am an active duty service member in the U.S. Navy. **This project is currently a personal project and has NO relation to the U.S. Government.**

### Is there a warranty for NAVFITOnline? what license is there?
NO. NAVFITOnline is released under MIT License with attribution required.

-----

#### Steps to host your own NAVFITOnline:

1. Install a web browser. *Tested in Chrome, but should be compatible with most browsers.* 
2. Get code with `git clone https://github.com/ansonl/navfit99-js.git` or use *Clone or download* button above.
3.  If desired, change `backendBaseURL` and `authBaseURL` in `js/constants.js` to point to your own instances of [navfit99-server](https://github.com/ansonl/navfit99-server) and [client-cert-auth](https://github.com/ansonl/client-cert-auth). 
  - See other project repos for specific setup directions.
4. Drag to a web accessible directory on your computer. 
5. Start web server and browse to `index.html` location to using NAVFITOnline. 
  - You can create a quick web server by starting command line (Windows+X) or terminal, navigating to the project directory (cd), and running `python -m http.server 8080`. (Requires Python). Visit `localhost:8080` to use the web app.
