// Load and re-export functions into global context so they can be
// used by our content script.
import { convertRecipeText } from './convert';

(<any>window).convertRecipeText = convertRecipeText;
