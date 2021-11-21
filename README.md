# ciphering-cli-tool

## Install and run

To check this application you should do a few simple steps.

1. Clone this repository to your PC executing the next command in your terminal
```bash
git clone https://github.com/Spomni/rss-nodejs-2021Q4.git
```

2. Go to the cloned folder
```bash
cd rss-nodejs-2021Q4/
```

3. Checkout to the actual development branch
```bash
git checkout task-1/dev
```

4. Run node and pass them the name of this application and its options
```bash
node index -c A
```

## How to use application

**ciphering-cli-tool** accepts three options (short alias and full name):

 * **_-c, --config_** - config for ciphers is a string with pattern {XY(-)}n, where:

    * X is a cipher mark:
      * C is for Caesar cipher (with shift 1)
      * A is for Atbash cipher
      * R is for ROT-8 cipher

    * Y is flag of encoding or decoding (mandatory for Caesar cipher and ROT-8 cipher and should not be passed Atbash cipher)
      * 1 is for encoding
      * 0 is for decoding

  * **_-i, --input_** - a path to input file

  * **_-o, --output_** - a path to output file

>NOTE: the --config option is required and the application will ended with errors if you miss this option.

> NOTE: Repository does not contain any files for the --input and the --output options!<br>
> Make sure to create these files before you try to run application with input/output options.
