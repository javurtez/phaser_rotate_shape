
export default class JSONManager {
    private static jsonManagerSingleton: JSONManager;

    public static Init(): void {
        if (!JSONManager.jsonManagerSingleton) {
            JSONManager.jsonManagerSingleton = new JSONManager();
        } else {
            throw new Error('You can only initialize one manager instance');
        }
    }

    
}