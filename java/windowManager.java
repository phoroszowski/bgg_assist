import java.awt.*;
import java.awt.event.InputEvent;

public class WindowManager {
    public static void focusWindow(int x, int y) throws AWTException {
        Robot robot = new Robot();
        robot.mouseMove(x, y);
        robot.mousePress(InputEvent.BUTTON1_DOWN_MASK);
        robot.mouseRelease(InputEvent.BUTTON1_DOWN_MASK);
    }

    public static String getActiveWindow() {
        // Placeholder implementation for getting the active window title
        // You might need to use JNI or JNA to get the actual active window title
        return "Dummy Window Title";
    }

    public static void main(String[] args) throws AWTException {
        if (args.length == 0) {
            System.out.println("Usage: java WindowManager <command> [args]");
            return;
        }
        String command = args[0];
        if (command.equals("focusWindow") && args.length == 3) {
            int x = Integer.parseInt(args[1]);
            int y = Integer.parseInt(args[2]);
            focusWindow(x, y);
        } else if (command.equals("getActiveWindow")) {
            System.out.println(getActiveWindow());
        } else {
            System.out.println("Unknown command or incorrect arguments");
        }
    }
}