const Post = require('../models/Post');
const assert = require('assert');
const { expect } = require('chai');


let post;


beforeEach(async () => {
  post = new Post({
    title: 'javascript',
    author: 'testing',
    content: 'testing content',
    imgUrl: 'Sample img url',
  });
  await post.save();
});


//  post Schema Tests
describe('Does all Crud operations', () => {
  it('creates a new post', async () => {
    const newPost = new Post({
      title: 'Learn php',
      author: 'Fred',
      content: 'I am here to learn!',
      imgUrl: 'Sample img url',
    });
    await newPost.save();
    assert(!newPost.isNew);
  });
  it('Reads all  Posts', async () => {
    const posts = await Post({});
    expect(posts).length.to.not.equal(0);
  });
});

describe('Deleting Post', () => {
  let mypost;
  beforeEach(async () => {
    mypost = new Post({
      title: 'deletion',
      author: 'deletion',
      content: 'deleted content',
      imgUrl: 'deleting img',
    });
    await mypost.save();
  });

  it('Removes post', async () => {
    const post = await Post.findOneAndRemove({ _id: mypost._id });
    const singlePost = await Post.findOne({ title: 'deletion' });
    assert(singlePost === null);
  });
});

describe('Update Post', () => {
  let mypost;
  beforeEach(async () => {
    mypost = new Post({
      title: 'updated',
      author: 'updated',
      content: 'updated content',
      imgUrl: 'Sample img url',
    });
    await mypost.save();
  });

  it('update new content', async () => {
    await Post.findOneAndUpdate(
      { _id: mypost._id },
      {
        title: 'new update',
        content: 'new content',
        author: 'new author',
        imgUrl: 'updated img',
      },
      { new: true }
    );
  });
});
