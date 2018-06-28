const Page = ({ children }) => <div className="page">{children}</div>
const Section = ({ children }) => (
  <section className="section">{children}</section>
)
const Title = ({ children }) => <h1>{children}</h1>
const TCY = ({ children }) => <span className="tcy">{children}</span>
const List = ({ children }) => <ul>{children}</ul>
const ListItem = ({ children }) => <li>{children}</li>

export default (
  <Page>
    <Section>
      <Title>Vibrant Book</Title>
    </Section>
    <Section>
      <Title>Introduction</Title>
    </Section>
    <Section>
      <Title>Why Vibrant?</Title>
      <Paragraph>
        Vibrantとは、<TCY>19</TCY>年に生まれた、組版プラットフォームです。具体的には以下のような機能を持っています。
        <List>
          <ListItem>柔軟な記法</ListItem>
          <ListItem>柔軟な記法</ListItem>
          <ListItem>柔軟な記法</ListItem>
        </List>
      </Paragraph>
    </Section>
  </Page>
)
