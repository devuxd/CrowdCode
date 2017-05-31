package Task1;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

/**
 * Created by paura on 4/28/2017.
 */
public class FindAndReplace {

    String []arr=null;
    protected String[] readFile(String file_path) {
        try {
            Scanner sc = new Scanner(new File(file_path));
            List<String> lines = new ArrayList<String>();
            while (sc.hasNextLine()) {
                lines.add(sc.nextLine());
            }

        this.arr = lines.toArray(new String[0]);
            return arr;
        } catch (FileNotFoundException E) {
        System.out.print("no file find");
        }
        return null;
    }

    protected int replaceWord(String[] file_content, String actual_word, String replace_word)
    {int count=0;
        for(int i=0;i<file_content.length;i++)
        {
            String[] testarr=file_content[i].split("[/ ]");
            for(int j=0;j<testarr.length;j++) {
                if (testarr[j].equals(actual_word)) {
                    testarr[j] = replace_word;
                    count++;
                }
            }
            StringBuffer format=new StringBuffer();
            for(int k=0;k<testarr.length;k++) {
                format.append(testarr[k]);
                format.append(" ");
            }
            file_content[i]= format.toString();
            }


        return count;
    }

    protected void writeFile(String file_path, String[] file_content) throws IOException
    {
        BufferedWriter outputWriter = null;
        outputWriter = new BufferedWriter(new FileWriter(file_path));
        for (int i = 0; i < file_content.length; i++) {
            // Maybe:
            outputWriter.write(file_content[i]+"");
            // Or:
          //  outputWriter.write(Integer.toString(x[i]);
            outputWriter.newLine();
        }
        outputWriter.flush();
        outputWriter.close();
    }

    public static void main(String args[]) throws IOException
    {
        FindAndReplace a= new FindAndReplace();
        Scanner scan = new Scanner(System.in);
        String path = scan.nextLine();
        String[] arr= a.readFile(path);

        String actual=scan.nextLine();
        String replace=scan.nextLine();
        int count= a.replaceWord(arr,actual,replace);
        a.writeFile(path,arr);
        System.out.println(count);


    }


}
