#include<bits/stdc++.h>
#define f(i,n) for(int i=0;i<n;i++)
#define fo(i,a,n) for(int i=a;i<n;i++)
#define ll long long int
#define li long int
using namespace std;
struct node{
    string word;
    int frequency;
    int height;
    struct node *lft;
    struct node *rgt;
};
bool search_word(struct node *root,string key)
{
    if(root==NULL)
        return false;
    else if(key==(root->word))
    {
        (root->frequency)=(root->frequency)+1;
        return true;
    }
    else if(key<(root->word))
        return search_word(root->lft,key);
    else
        return search_word(root->rgt,key);
}
int height_tree(struct node *root)
{
    if(root==NULL)
        return 0;
    else
        return root->height;
}
int getfactor(struct node *root)
{
    return (height_tree(root->lft)-height_tree(root->rgt));
}
struct node* newnode(string key)
{
    struct node *temp=new node();
    temp->word=key;
    temp->frequency=1;
    temp->height=1;
    temp->lft=NULL;
    temp->rgt=NULL;
    return temp;
}
struct node* leftrotate(struct node *root)
{
    struct node *temp=(root->rgt);
    (root->rgt)=(temp->lft);
    temp->lft=root;
    return temp;
}

struct node* rightrotate(struct node *root)
{
    struct node *temp=(root->lft);
    (root->lft)=(temp->rgt);
    temp->rgt=root;
    return temp;
}


struct node* insert_word(struct node *root,string key)
{
    if(root==NULL)
        return newnode(key);
    else if(key<root->word)
        root->lft=insert_word(root->lft,key);
    else
        root->rgt=insert_word(root->rgt,key);
    root->height=1+max(height_tree(root->lft),height_tree(root->rgt));
    int factor=getfactor(root);
    if(factor>1&&key<((root->lft)->word))
        return rightrotate(root);
    else if(factor>1&&key>((root->lft)->word))
    {
        root->lft=leftrotate(root->lft);
        return rightrotate(root);
    }
    else if(factor<-1&&key>((root->rgt)->word))
        return leftrotate(root);
    else if(factor<-11&&key<((root->rgt)->word))
    {
        root->rgt=rightrotate(root->rgt);
        return leftrotate(root);
    }

    return root;
}

void display(struct node *root)
{
    if(root==NULL)
        return;
    display(root->lft);
    cout<<(root->word)<<": "<<(root->frequency)<<endl;
    display(root->rgt);
}

int main()
{
    ifstream fout;
    vector<string> v;
    fout.open("./hello.txt");
    while(!fout.eof())
    {
        string str;
        string str1;
        fout>>str;
        int l=str.length();
        f(i,l)
        {
            if(str[i]>='A'&&str[i]<='Z')
                str[i]+=32;
        }
        if(str.end()!=find(str.begin(),str.end(),'.'))
        {

            int len=find(str.begin(),str.end(),'.')-str.begin();
            v.push_back(str.substr(0,len));
            str1=str.substr(len+1);
            if(!str1.empty())
                v.push_back(str1);
        }
        else
            v.push_back(str);

    }
    fout.close();
    struct node *root=NULL;
    for(auto word:v)
    {
        if(!search_word(root,word))
        {
            root=insert_word(root,word);
        }
    }
    display(root);
}
