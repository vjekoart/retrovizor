class TextInterface
{
    elementUserInterface;
    elementUserInteraction;
    elementCommandLabel;
    elementUserInput;
    elementUserSubmit;
    elementProgramOutput;

    constructor()
    {
        this.elementUserInterface   = document.getElementById( "user-interface"            );
        this.elementUserInteraction = document.getElementById( "user-interaction"          );
        this.elementCommandLabel    = document.querySelector ( "label[for=\"user-input\"]" );
        this.elementUserInput       = document.getElementById( "user-input"                );
        this.elementProgramOutput   = document.getElementById( "program-output"            );
    }

    initialize( story )
    {
        this.story = story;

        this.registerFormListener();
    }

    registerFormListener()
    {
        this.elementUserInteraction.addEventListener( "submit", ( ev ) => {
            ev.preventDefault();

            const userInput = this.elementUserInput.value;
            const storyOutput = this.story.nextStep( userInput );

            this.elementUserInput.value = "";

            if ( storyOutput )
            {
                this.sendConsoleMessage( `> ${ userInput }`, true );
                this.sendConsoleMessage( storyOutput );
            }
        } );
    }

    async sendConsoleMessage( message, instant = false )
    {
        if ( instant )
        {
            this.elementProgramOutput.value += `${ message }\n`;
            return;
        }

        for ( const letter of message )
        {
            await this.typeLetter( letter );
        }

        this.typeLetter( "\n" );
    }

    typeLetter( letter )
    {
        return new Promise( ( resolve ) => {
            window.setTimeout( () => {
                this.elementProgramOutput.value += letter;
                resolve();
            }, 50 );
        } );
    }
}

const SAMPLE_STORY =
{
    "START":
    {
        "Hi": { nextStep: "YOUR-NAME", message: "Hey man. What's your name?" }
    },
    "YOUR-NAME":
    {
        ".+": { nextStep: null, message: "%s? Do I look like I care? Leave me alone..." }
    }
};

class Story
{
    activeStep = "START";
    steps = {};

    constructor( storyData )
    {
        this.steps = storyData;
    }

    nextStep( userInput )
    {
        if ( this.activeStep === null )
        {
            return null;
        }

        const stepMatch = Object.keys( this.steps[ this.activeStep ] ).find( ( stepMatch ) => {
            const regex = new RegExp( stepMatch, "i" );

            if ( userInput.match( regex ) )
            {
                return true;
            }
        } );

        if ( !stepMatch )
        {
            return null;
        }

        const stepAction = this.steps[ this.activeStep ][ stepMatch ];

        this.activeStep = stepAction.nextStep;
        return stepAction.message.replace( "%s", userInput );
    }
}

function main()
{
    const ui = new TextInterface();

    const story = new Story( SAMPLE_STORY );
    ui.initialize( story );
}

window.addEventListener("DOMContentLoaded", main);
