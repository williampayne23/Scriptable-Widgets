// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: magic;
///<reference path="../index.d.ts" />

let posts = await getForumPosts()

if (config.runsInWidget) {
    let w = await createWidget(posts)
    Script.setWidget(w)
} else {
    let table = createTable(posts)
    await QuickLook.present(table)
    Script.complete()
}
Script.complete()



async function createWidget(items) {
    const item = items[Math.floor(Math.random() * items.length)];


    let gradient = new LinearGradient()
    gradient.locations = [0, 1]
    gradient.colors = [
        new Color("#b00a0fe6"),
        new Color("#b00a0fb3")
    ]


    let widget = new ListWidget()
    let nextRefresh = Date.now() + 1000*60*60
    widget.refreshAfterDate = new Date(nextRefresh)

    widget.backgroundColor = new Color("#b00a0f")
    widget.backgroundGradient = gradient

    // Add spacer above content to center it vertically.
    widget.addSpacer()
    // Show article headline.
    let titleElement = widget.addText(item.title)
    titleElement.font = Font.boldSystemFont(16)
    titleElement.textColor = Color.white()
    titleElement.minimumScaleFactor = 0.75
    // Add spacing below headline.
    widget.addSpacer(8)
    // Add footer woth authors and date.
    let footerStack = widget.addStack()

    let karmaElement = footerStack.addText(item.karma)
    karmaElement.font = Font.mediumSystemFont(12)
    karmaElement.textColor = Color.white()
    karmaElement.textOpacity = 0.9
    footerStack.addSpacer(4)
    let authorsElement = footerStack.addText(item.authors.join(','))
    authorsElement.font = Font.mediumSystemFont(12)
    authorsElement.textColor = Color.white()
    authorsElement.textOpacity = 0.9
    footerStack.addSpacer()
    let dateElement = footerStack.addText(item.date)
    dateElement.font = Font.mediumSystemFont(12)
    dateElement.textColor = Color.white()
    dateElement.textOpacity = 0.9
    // Add spacing below content to center it vertically.
    widget.addSpacer()
    // Set URL to open when tapping widget.
    widget.url = item.url
    return widget
}


async function getForumPosts() {
    let wv = new WebView()
    wv.loadURL("https://forum.effectivealtruism.org")

    let js = `
    function getPostDetails(post){
        let karma = post.getElementsByClassName("PostsItem2-karma")[0].children[0].innerHTML;
        let postA = post.getElementsByClassName("PostsTitle-root")[0].children[0]
        let title = postA.children[0].children[0].innerHTML
        let url = postA.href
        let authors = Array.prototype.slice.call(post.getElementsByClassName("UsersNameDisplay-userName")).map(i => i.innerHTML)
        let date = post.getElementsByClassName("PostsItemDate-postedAt")[0].innerHTML
        return {title, url, karma, authors, date}
    }
    arr = Array.prototype.slice.call(document.getElementsByClassName("PostsList2-posts")[0].getElementsByClassName("PostsItem2-postsItem"))
    arr.map(getPostDetails)
    `

    await wv.waitForLoad()
    return await wv.evaluateJavaScript(js, false)
}

function createTable(posts) {
    let table = new UITable()
    for (post of posts) {
        let row = new UITableRow()
        let cell = UITableCell.text(post.title, post.karma + " " + post.authors.join(",") + " " + post.date)
        row.addCell(cell)

        // let title = post.title
        // let titleCell = row.addText(title)
        // titleCell.widthWeight = 80
        // titleCell.titleFont = Font.mediumSystemFont(12)


        // let authorCell = row.addText(post.authors.join(','))
        // authorCell.widthWeight = 30
        // authorCell.titleFont = Font.mediumSystemFont(12)

        row.height = 60
        row.cellSpacing = 10
        row.onSelect = (idx) => {
            let post = posts[idx]
            Safari.open(post.url)
        }
        row.dismissOnSelect = true
        table.addRow(row)
    }
    return table
}
